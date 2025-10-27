import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UserDetailsDialogComponent } from './components/user-details-dialog/user-details-dialog.component';
import { UserAddDialogComponent } from './components/user-add-dialog/user-add-dialog.component';
import type { UserResponse } from '@pdr.cloud/libs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = signal<UserResponse[]>([]);
  filteredUsers = signal<UserResponse[]>([]);
  displayedUsers = signal<UserResponse[]>([]);
  searchTerm = '';
  pageSize = 25;
  pageIndex = 0;
  columns = ['id', 'name', 'email', 'role'];

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<UserResponse[]>(`${environment.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.filteredUsers.set(data);
        this.updateDisplayedUsers();
      },
      error: () => {
        this.snackBar.open('Fehler beim Laden der User', 'OK', { duration: 3000 });
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.users().filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
    this.pageIndex = 0;
    this.updateDisplayedUsers();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedUsers();
  }

  updateDisplayedUsers() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedUsers.set(this.filteredUsers().slice(start, end));
  }

  openDetails(user: UserResponse) {
    this.dialog.open(UserDetailsDialogComponent, {
      width: '500px',
      data: { userId: user.id }
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(UserAddDialogComponent, {
      width: '600px'
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }
}

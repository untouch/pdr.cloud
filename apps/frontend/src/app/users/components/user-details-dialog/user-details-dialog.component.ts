import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import type { UserResponse } from '@pdr.cloud/libs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-details-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './user-details-dialog.component.html',
  styleUrl: './user-details-dialog.component.scss'
})
export class UserDetailsDialogComponent implements OnInit {
  private http = inject(HttpClient);
  data = inject<{ userId: number }>(MAT_DIALOG_DATA);

  user = signal<UserResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.http.get<UserResponse>(`${environment.apiUrl}/users/${this.data.userId}`).subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

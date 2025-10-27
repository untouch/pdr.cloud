import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { userCreateSchema, requiredFieldsByRole } from '@pdr.cloud/libs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-add-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './user-add-dialog.component.html',
  styleUrl: './user-add-dialog.component.scss'
})
export class UserAddDialogComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<UserAddDialogComponent>);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer', Validators.required],
    phoneNumber: [''],
    birthDate: [''],
  });

  constructor() {
    this.form.get('role')?.valueChanges.subscribe(role => {
      const required = requiredFieldsByRole[role as string] || [];

      Object.keys(this.form.controls).forEach(field => {
        if (field === 'firstName' || field === 'lastName' || field === 'email' || field === 'role') {
          return;
        }

        const fcontrol = this.form.get(field);
        if (fcontrol) {
          fcontrol.clearValidators();
          if (required.includes(field)) {
            fcontrol.setValidators([Validators.required]);
          }
          fcontrol.updateValueAndValidity();
        }
      });
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formData = this.form.value;
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      phoneNumber: formData.phoneNumber || undefined,
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
    };

    try {
      userCreateSchema.parse(payload);
    } catch (err: any) {
      this.snackBar.open('Validierungsfehler: ' + err.errors[0].message, 'OK', { duration: 3000 });
      return;
    }

    this.http.post(`${environment.apiUrl}/users`, payload).subscribe({
      next: () => {
        this.snackBar.open('User erfolgreich erstellt', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open('Fehler beim Erstellen: ' + (err.error?.message || 'Unbekannter Fehler'), 'OK', { duration: 3000 });
      }
    });
  }
}

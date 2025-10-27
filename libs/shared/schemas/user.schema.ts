import { z } from 'zod';

/* Zentrale Liste der Benutzerrollen. Für API sowie Frontend */
export const UserRoles = z.enum(['admin', 'editor', 'viewer']);

/* Zentrale Einstellung der Pflichtfelder zur prüfung im users.service sowie im Frontend-Formular */
export const requiredFieldsByRole: Record<string, string[]> = {
  admin: ['phoneNumber', 'birthDate'],
  editor: ['phoneNumber'],
  viewer: []
};
/* Userschema definieren */
const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  role: UserRoles,
});

/* Wird verwendet in der users.service und frontend zur Validierung auf Basis der Rolle */
export const userCreateSchema = userSchema
  .refine((data) => data.role !== 'admin' || data.phoneNumber, {
    message: 'Telefonnummer erforderlich',
    path: ['phoneNumber'],
  })
  .refine((data) => data.role !== 'admin' || data.birthDate, {
    message: 'Geburtsdatum erforderlich',
    path: ['birthDate'],
  })
  .refine((data) => data.role !== 'editor' || data.phoneNumber, {
    message: 'Pflichtfeld',
    path: ['phoneNumber'],
  });

/* Wird genutzt beim Laden aller oder einzelner Benutzer genutzt -> gibt zusätzlich noch die UserID mit */
export const userResponseSchema = userSchema.extend({
  id: z.number().int().positive()
});

export type UserRoleType = z.infer<typeof UserRoles>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

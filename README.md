# Usermanagement

## Verwendete Technologien
```bash
- Angular 20.3
- NestJS 11,
- Material 3
- Zod Validation.
```

## Installation

```bash
npm ci
```

## Entwicklung

Backend und Frontend starten:

```bash
npm run serve:api
npm run serve:frontend
- oder parallel -
npm run serve:all
```
## Seiten
```bash
- API: http://localhost:5000
- Frontend: http://localhost:4200
- Smiley: http://localhost:4200/smiley
```

## Projekt-Struktur

```
apps/
  api/          NestJS Backend (Port 5000)
    data/       user.json
  frontend/     Angular 20.3 + Material 3
libs/
  shared/       Zod Schemas, Types (geteilt zwischen Frontend/Backend)

```

## Funktionen

### API
- GET /users - Gibt alle Einträge aus users.json zurück
- GET /users/:id - Gibt User mit übergebener ID zurück
- POST /users - Legt neuen User an
- Zod Validation mit gemeinsamem Schema
- Datei-basierte Persistierung (data/users.json)
- Queue für Write-Operationen
- Logging middleware zur Überwachung der Aufrufe

### Frontend (Angular + Material 3)
- User Materialtabelle mit Pagination (25/Seite) und Fulltext-Suche
- User Details Dialog
- User erstellen mit Reactive Forms
- Material 3 Theme
- Beim erstellen eines Users wird auf Basis der Rolle validiert:
  - Rolle: admin: phone + birthDate Pflichtfeld
  - Rolle: editor: phone pFlichtfeld
- Smiley Component mit einem weniger guten Smiley :)

### Schema / Types
- UserResponse inkl. Validation
- UserRoleType inkl. Validation
- UserCreate inkl. Validation

## Architekturentscheidung
- Techstack wurde vorgegeben 
- Logging der API um eventuelle bottlenecks zu identifizieren

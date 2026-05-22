# Plan de tests — BlablaBook API

> **Types de test :** `Unitaire` = test isolé avec mocks (Jest) · `Intégration` = requête HTTP complète contre l'API en cours d'exécution (guards, pipeline NestJS inclus) · `E2E` = parcours complet navigateur → frontend → API → base de données (Playwright)

---

## 1. Authentification (`/auth`)

### 1.1 Inscription — `POST /auth/register`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Inscription avec un email déjà utilisé | Unitaire | `{ email: "existant@test.com", password: "Valid1!passw0rd" }` | 409 : email déjà utilisé | 409 : ConflictException levée | ✅ |
| Inscription avec un email invalide (format incorrect) | Unitaire | `{ email: "pasunemail", password: "Valid1!passw0rd" }` | 400 : email incorrect | 400 : BadRequestException levée | ✅ |
| Inscription avec un mot de passe trop court (< 12 caractères) | Unitaire | `{ email: "new@test.com", password: "Short1!" }` | 400 : mot de passe trop court | 400 : BadRequestException levée | ✅ |
| Inscription avec un mot de passe sans majuscule | Unitaire | `{ email: "new@test.com", password: "nouppercase1!extra" }` | 400 : mot de passe sans majuscule | 400 : BadRequestException levée | ✅ |
| Inscription avec un mot de passe sans minuscule | Unitaire | `{ email: "new@test.com", password: "NOLOWERCASE1!EXTRA" }` | 400 : mot de passe sans minuscule | 400 : BadRequestException levée | ✅ |
| Inscription avec un mot de passe sans chiffre | Unitaire | `{ email: "new@test.com", password: "NoDigitHere!extra" }` | 400 : mot de passe sans chiffre | 400 : BadRequestException levée | ✅ |
| Inscription avec un mot de passe sans caractère spécial | Unitaire | `{ email: "new@test.com", password: "NoSpecialChar1extra" }` | 400 : mot de passe sans caractère spécial | 400 : BadRequestException levée | ✅ |
| Inscription avec un nom d'utilisateur trop court (< 3 caractères) | Unitaire | `{ email: "new@test.com", password: "Valid1!passw0rd", username: "ab" }` | 400 : nom d'utilisateur trop court | | |
| Inscription avec un nom d'utilisateur trop long (> 30 caractères) | Unitaire | `{ email: "new@test.com", password: "Valid1!passw0rd", username: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }` | 400 : nom d'utilisateur trop long | | |
| Inscription avec un email libre et un mot de passe robuste (sans pseudo) | Unitaire | `{ email: "libre@test.com", password: "Valid1!passw0rd", username: "" }` | 201 : inscription réussie | 201 : token retourné, username déduit du préfixe email | ✅ |
| Inscription avec un email libre, un mot de passe robuste et un pseudo | Unitaire | `{ email: "libre2@test.com", password: "Valid1!passw0rd", username: "MonPseudo" }` | 201 : inscription réussie | 201 : token retourné, password absent de la réponse | ✅ |

### 1.2 Connexion — `POST /auth/login`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Connexion avec un email inexistant | Unitaire | `{ email: "inconnu@test.com", password: "Valid1!passw0rd" }` | 401 : email inexistant | 401 : UnauthorizedException levée | ✅ |
| Connexion avec un email existant et un mot de passe incorrect | Unitaire | `{ email: "existant@test.com", password: "MauvaisMotDePasse1!" }` | 401 : mot de passe incorrect | 401 : UnauthorizedException levée | ✅ |
| Connexion avec un email existant et un mot de passe correct | Unitaire | `{ email: "existant@test.com", password: "Valid1!passw0rd" }` | 201 : connexion réussie, token JWT retourné | 201 : token JWT retourné | ✅ |

---

## 2. Utilisateurs (`/users`)

### 2.1 Récupération — `GET /users`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer tous les utilisateurs sans token | Intégration | Aucun header Authorization | 401 : accès non autorisé | | |
| Récupérer tous les utilisateurs avec un token utilisateur simple | Intégration | `Authorization: Bearer <token_user>` | 403 : droits insuffisants (admin requis) | | |
| Récupérer tous les utilisateurs avec un token admin | Intégration | `Authorization: Bearer <token_admin>` | 200 : liste paginée des utilisateurs | | |
| Récupérer les utilisateurs avec paramètre de recherche (`search`) | Intégration | `Authorization: Bearer <token_admin>`, query `?search=jean` | 200 : liste filtrée des utilisateurs | | |
| Récupérer le nombre total d'utilisateurs sans token | Intégration | Aucun header Authorization | 401 : accès non autorisé | | |
| Récupérer le nombre total d'utilisateurs avec un token admin | Intégration | `Authorization: Bearer <token_admin>` | 200 : nombre d'utilisateurs retourné | | |

### 2.2 Profil — `GET /users/profil/:id`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer le profil d'un utilisateur inexistant | Unitaire | Paramètre `id` inexistant en base | 404 : utilisateur non trouvé | | |
| Récupérer le profil privé d'un autre utilisateur sans token | Intégration | Paramètre `id` d'un profil privé, aucun header Authorization | 403 : profil privé | | |
| Récupérer le profil privé de son propre compte | Intégration | `Authorization: Bearer <token_user>`, paramètre `id` correspondant au token | 200 : profil retourné | | |
| Récupérer le profil public d'un utilisateur sans token | Intégration | Paramètre `id` d'un profil public, aucun header Authorization | 200 : profil retourné | | |

### 2.3 Détail utilisateur — `GET /users/:id`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer un utilisateur avec un ID invalide (non numérique) | Intégration | Paramètre `id: "abc"` | 400 : paramètre invalide | | |
| Récupérer un utilisateur inexistant | Unitaire | Paramètre `id: 99999` | 404 : utilisateur non trouvé | | |
| Récupérer un utilisateur existant | Unitaire | Paramètre `id` d'un utilisateur existant | 200 : données utilisateur retournées | | |

### 2.4 Mise à jour — `PATCH /users/:id`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Modifier un utilisateur sans token | Intégration | Aucun header Authorization, `{ username: "Nouveau" }` | 401 : accès non autorisé | | |
| Modifier le profil d'un autre utilisateur (non admin) | Intégration | `Authorization: Bearer <token_user>`, `id` d'un autre utilisateur | 403 : droits insuffisants | | |
| Modifier son propre profil avec des données valides | Intégration | `Authorization: Bearer <token_user>`, `{ username: "NouveauNom" }` | 200 : profil mis à jour | | |
| Uploader une photo de profil avec un format non autorisé (ex: pdf) | Unitaire | `Authorization: Bearer <token_user>`, fichier `profile.pdf` | 400 : seules les images sont autorisées | | |
| Uploader une photo de profil dépassant 5 Mo | Unitaire | `Authorization: Bearer <token_user>`, image > 5 Mo | 400 / 413 : fichier trop volumineux | | |
| Uploader une photo de profil valide (jpg/png) | Intégration | `Authorization: Bearer <token_user>`, image jpg valide ≤ 5 Mo | 200 : photo mise à jour | | |
| Modifier le rôle d'un utilisateur sans token admin | Intégration | `Authorization: Bearer <token_user>`, `{ role: "ADMIN" }` | 403 : droits insuffisants | | |
| Modifier le rôle d'un utilisateur avec un token admin | Intégration | `Authorization: Bearer <token_admin>`, `{ role: "ADMIN" }` | 200 : rôle mis à jour | | |

### 2.5 Suppression — `DELETE /users/:id`

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Supprimer un utilisateur sans token | Intégration | Aucun header Authorization | 401 : accès non autorisé | | |
| Supprimer le compte d'un autre utilisateur (non admin) | Intégration | `Authorization: Bearer <token_user>`, `id` d'un autre utilisateur | 403 : droits insuffisants | | |
| Supprimer son propre compte | Intégration | `Authorization: Bearer <token_user>`, `id` correspondant au token | 204 : suppression réussie | | |
| Supprimer un utilisateur avec un token admin | Intégration | `Authorization: Bearer <token_admin>`, `id` d'un utilisateur existant | 204 : suppression réussie | | |

---

## 3. Livres (`/books`)

### 3.1 Consultation

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer tous les livres | Unitaire | `getBooks()` sans userId | 200 : liste de livres | 200 : liste mappée retournée (userBookId: null) | ✅ |
| Récupérer des livres aléatoires | Unitaire | `getRandomBooks(10)` | 200 : 10 livres aléatoires | 200 : findMany appelé avec `take: 10` et offset aléatoire | ✅ |
| Récupérer les livres les plus populaires | Unitaire | `getMostPopularBooks(10)` | 200 : 10 livres populaires | 200 : livres triés par `averageRating desc` | ✅ |
| Récupérer les derniers livres ajoutés | Unitaire | `getLatestBooks(10)` | 200 : 10 derniers livres | 200 : livres triés par `publishing_date desc` | ✅ |
| Récupérer les livres les plus ajoutés aux bibliothèques | Unitaire | `mostAddedBooks(10)` | 200 : liste des livres les plus ajoutés | 200 : liste enrichie avec `addedCount` | ✅ |
| Récupérer les livres les plus commentés | Unitaire | `mostCommentedBooks(10)` | 200 : liste des livres les plus commentés | 200 : liste enrichie avec `commentCount` | ✅ |

### 3.2 Recherche

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Rechercher des livres avec un terme valide | Unitaire | `searchBooks("prince")` | 200 : résultats correspondants | 200 : findMany avec filtre OR titre/auteur/isbn | ✅ |
| Rechercher des livres sans terme de recherche | Intégration | `GET /books/search` (sans paramètre `q`) | 400 : paramètre `q` manquant ou invalide | | |
| Rechercher des livres via l'API externe Open Library | Unitaire | `searchBooksWithOpenLibraryApi("prince")` (HttpService mocké) | 200 : résultats de l'API externe | 200 : docs filtrés (edition_key vide exclus) | ✅ |
| Récupérer un livre par son ID | Unitaire | `findOne(1)` | 200 : données du livre | 200 : livre retourné avec comments et rates | ✅ |
| Récupérer un livre avec un ID inexistant | Unitaire | `findOne(999)` | 404 : livre non trouvé | 404 : NotFoundException levée ("Livre non trouvé") | ✅ |

---

## 4. Commentaires (`/comments`)

### 4.1 Consultation

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer tous les commentaires | Intégration | `GET /comments` | 200 : liste paginée des commentaires | | |
| Récupérer les derniers commentaires par livre | Intégration | `GET /comments/latest-per-book` | 200 : dernier commentaire par livre | | |
| Récupérer le nombre de commentaires sans token admin | Intégration | Aucun header Authorization ou token utilisateur simple | 401/403 : accès refusé | | |
| Récupérer le nombre de commentaires avec un token admin | Intégration | `Authorization: Bearer <token_admin>` | 200 : nombre de commentaires | | |
| Récupérer les commentaires à modérer sans token admin | Intégration | Aucun header Authorization ou token utilisateur simple | 401/403 : accès refusé | | |
| Récupérer les commentaires à modérer avec un token admin | Intégration | `Authorization: Bearer <token_admin>` | 200 : liste des commentaires à modérer | | |
| Récupérer le nombre de commentaires signalés sans token admin | Intégration | Aucun header Authorization ou token utilisateur simple | 401/403 : accès refusé | | |
| Récupérer le nombre de commentaires signalés avec un token admin | Intégration | `Authorization: Bearer <token_admin>` | 200 : nombre de commentaires signalés | | |

### 4.2 Création & modération

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Créer un commentaire sans être authentifié | Intégration | Aucun header Authorization, `{ bookId: 1, content: "Super livre" }` | 401 : accès non autorisé | | |
| Créer un commentaire avec des champs manquants | Unitaire | `Authorization: Bearer <token_user>`, `{ bookId: 1 }` (content absent) | 400 : données invalides | | |
| Créer un commentaire valide en étant authentifié | Intégration | `Authorization: Bearer <token_user>`, `{ bookId: 1, content: "Super livre !" }` | 201 : commentaire créé | | |
| Signaler un commentaire sans être authentifié | Intégration | Aucun header Authorization, `id` d'un commentaire existant | 401 : accès non autorisé | | |
| Signaler un commentaire existant en étant authentifié | Intégration | `Authorization: Bearer <token_user>`, `id` d'un commentaire existant | 201 : signalement enregistré | | |
| Approuver un commentaire sans token admin | Intégration | Aucun header Authorization ou token utilisateur simple | 401/403 : accès refusé | | |
| Approuver un commentaire avec un token admin | Intégration | `Authorization: Bearer <token_admin>`, `id` d'un commentaire en attente | 200 : commentaire approuvé | | |
| Rejeter un commentaire sans token admin | Intégration | Aucun header Authorization ou token utilisateur simple | 401/403 : accès refusé | | |
| Rejeter un commentaire avec un token admin | Intégration | `Authorization: Bearer <token_admin>`, `id` d'un commentaire en attente | 200 : commentaire rejeté | | |

---

## 5. Notes (`/rate`)

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer la note moyenne d'un livre existant | Unitaire | `bookId` d'un livre existant et noté | 200 : note moyenne retournée | | |
| Récupérer la note moyenne d'un livre inexistant | Unitaire | `bookId: 99999` | 200 : note null / 0 | | |
| Récupérer sa note pour un livre sans être authentifié | Intégration | Aucun header Authorization, `bookId` valide | 401 : accès non autorisé | | |
| Récupérer sa note pour un livre en étant authentifié (note existante) | Intégration | `Authorization: Bearer <token_user>`, `bookId` d'un livre déjà noté | 200 : note retournée | | |
| Récupérer sa note pour un livre où aucune note n'a été donnée | Intégration | `Authorization: Bearer <token_user>`, `bookId` d'un livre non noté | 200 : message "No rating found for this book" | | |
| Créer une note sans être authentifié | Intégration | Aucun header Authorization, `{ bookId: 1, value: 4 }` | 401 : accès non autorisé | | |
| Créer une note valide en étant authentifié | Intégration | `Authorization: Bearer <token_user>`, `{ bookId: 1, value: 4 }` | 201 : note créée | | |
| Créer une note pour un livre déjà noté | Unitaire | `Authorization: Bearer <token_user>`, `{ bookId: 1, value: 5 }` (note déjà existante) | 400/409 : note déjà existante | | |
| Modifier une note sans être authentifié | Intégration | Aucun header Authorization, `{ value: 3 }` | 401 : accès non autorisé | | |
| Modifier une note existante en étant authentifié | Intégration | `Authorization: Bearer <token_user>`, `{ value: 3 }`, `bookId` d'un livre déjà noté | 200 : note mise à jour | | |
| Modifier une note inexistante | Unitaire | `Authorization: Bearer <token_user>`, `bookId: 99999` | 404 : note non trouvée | | |

---

## 6. Bibliothèque utilisateur (`/userbook`)

| Fonctionnalité testée | Type de test | Donnée en entrée | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| Récupérer le nombre de livres lus | Intégration | `GET /userbook/book-read-count` | 200 : nombre retourné | | |
| Ajouter un livre à sa bibliothèque sans être authentifié | Intégration | Aucun header Authorization, `{ bookId: 1 }` | 401 : accès non autorisé | | |
| Ajouter un livre à la bibliothèque d'un autre utilisateur | Intégration | `Authorization: Bearer <token_user>`, path params `userId` d'un autre utilisateur et `bookId=1` (`POST /userbook/add/:userId/:bookId`) | 401 : permission refusée | | |
| Ajouter un livre à sa propre bibliothèque en étant authentifié | Intégration | `Authorization: Bearer <token_user>`, path params `userId` correspondant au token et `bookId=1` (`POST /userbook/add/:userId/:bookId`) | 201 : livre ajouté avec statut NOT_READ | | |
| Ajouter un livre déjà présent dans sa bibliothèque | Unitaire | `Authorization: Bearer <token_user>`, `{ bookId: 1 }` (déjà ajouté) | 400/409 : livre déjà dans la bibliothèque | | |
| Mettre à jour le statut d'un livre sans être authentifié | Intégration | Aucun header Authorization, `{ status: "READ" }` | 401 : accès non autorisé | | |
| Mettre à jour le statut d'un livre avec un statut invalide | Unitaire | `Authorization: Bearer <token_user>`, `{ status: "INVALIDE" }` | 400 : statut invalide | | |
| Mettre à jour le statut d'un livre avec un statut valide | Intégration | `Authorization: Bearer <token_user>`, `{ status: "READ" }` | 200 : statut mis à jour | | |
| Supprimer un livre de sa bibliothèque sans être authentifié | Intégration | Aucun header Authorization, `id` d'une entrée userbook | 401 : accès non autorisé | | |
| Supprimer un livre appartenant à un autre utilisateur | Intégration | `Authorization: Bearer <token_user>`, `id` d'une entrée appartenant à un autre utilisateur | 401/403 : permission refusée | | |
| Supprimer un livre de sa propre bibliothèque | Intégration | `Authorization: Bearer <token_user>`, `id` d'une entrée lui appartenant | 204 : livre supprimé | | |
| Vérifier si un livre est dans sa bibliothèque sans être authentifié | Intégration | Aucun header Authorization, `bookId` valide | 401 : accès non autorisé | | |
| Vérifier si un livre est dans la bibliothèque d'un autre utilisateur | Intégration | `Authorization: Bearer <token_user>`, `userId` d'un autre utilisateur | 401 : permission refusée | | |
| Vérifier si un livre existant est dans sa bibliothèque (présent) | Intégration | `Authorization: Bearer <token_user>`, `bookId` d'un livre présent dans sa bibliothèque | 200 : true | | |
| Vérifier si un livre non ajouté est dans sa bibliothèque (absent) | Intégration | `Authorization: Bearer <token_user>`, `bookId` d'un livre absent de sa bibliothèque | 200 : false | | |

---

## 7. Tests E2E Navigateur (Playwright)

> Ces tests couvrent le parcours complet : **navigateur → frontend (Next.js) → API (NestJS) → base de données (PostgreSQL)**. L'outil utilisé est **Playwright**. Chaque test s'exécute contre l'application complète déployée via `docker-compose`.

### 7.1 Authentification

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Inscription complète | E2E | Naviguer vers `/register`, remplir email, mot de passe et pseudo valides, soumettre le formulaire | Redirection vers la page d'accueil, session active, pseudo affiché dans la navbar | Nouvelle entrée dans `User`, mot de passe haché, `role: USER` | |
| Inscription avec email déjà utilisé | E2E | Naviguer vers `/register`, saisir un email existant, soumettre | Message d'erreur affiché dans le formulaire, pas de redirection | Aucune nouvelle entrée créée dans `User` | |
| Connexion réussie | E2E | Naviguer vers `/login`, saisir email et mot de passe valides, soumettre | Redirection vers la page d'accueil, session active, pseudo affiché dans la navbar | Aucune modification en base, session NextAuth créée | |
| Connexion avec mauvais mot de passe | E2E | Naviguer vers `/login`, saisir email valide et mot de passe incorrect, soumettre | Message d'erreur affiché dans le formulaire, pas de redirection | Aucune session créée | |
| Déconnexion | E2E | Connecté, cliquer sur le bouton de déconnexion dans la navbar | Redirection vers `/login`, navbar affiche les boutons de connexion | Session NextAuth supprimée | |

### 7.2 Recherche et consultation de livres

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Recherche d'un livre par titre | E2E | Saisir un terme dans la barre de recherche, valider | Liste de résultats affichée avec les livres correspondants | Résultats cohérents avec la table `Book` filtrée par titre/auteur | |
| Consultation de la page détail d'un livre | E2E | Cliquer sur un livre dans les résultats | Page détail affichée avec titre, auteur, description, note moyenne et commentaires approuvés | Données cohérentes avec l'enregistrement `Book`, commentaires issus de `Comment` avec `status: APPROVED` | |
| Accès à la page d'accueil sans connexion | E2E | Naviguer vers `/` sans être connecté | Page d'accueil affichée avec livres populaires, dernières sorties et derniers avis | Données cohérentes avec les livres et commentaires en base | |

### 7.3 Bibliothèque utilisateur

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Ajout d'un livre à la bibliothèque | E2E | Connecté, naviguer vers la page détail d'un livre, cliquer sur "Ajouter à ma bibliothèque" | Bouton change d'état, confirmation visuelle | Nouvelle entrée dans `UserBook` avec `status: NOT_READ`, `userId` et `bookId` corrects | |
| Changement de statut d'un livre (NOT_READ → READ) | E2E | Connecté, aller dans sa bibliothèque, changer le statut d'un livre | Statut mis à jour visuellement | Entrée `UserBook` mise à jour avec `status: READ` | |
| Suppression d'un livre de la bibliothèque | E2E | Connecté, aller dans sa bibliothèque, supprimer un livre | Livre retiré de la liste | Entrée `UserBook` supprimée de la base | |
| Accès à la bibliothèque sans connexion | E2E | Naviguer vers la page bibliothèque sans être connecté | Redirection vers `/login` | Aucune requête en base déclenchée | |

### 7.4 Commentaires et notes

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Rédaction et soumission d'un commentaire | E2E | Connecté, naviguer vers la page d'un livre, rédiger un commentaire et soumettre | Message de confirmation, formulaire réinitialisé, commentaire absent de la liste publique (en attente) | Nouvelle entrée dans `Comment` avec `status: PENDING`, `userId` et `bookId` corrects | |
| Tentative de commenter sans être connecté | E2E | Non connecté, naviguer vers la page d'un livre, tenter d'accéder au formulaire de commentaire | Redirection vers `/login` ou invitation à se connecter affichée | Aucune entrée créée dans `Comment` | |
| Notation d'un livre | E2E | Connecté, naviguer vers la page d'un livre, sélectionner une note (ex. 4 étoiles) | Note affichée comme sélectionnée, note moyenne recalculée dans l'UI | Nouvelle entrée dans `Rate` avec `value: 4`, `userId` et `bookId` corrects | |
| Modification d'une note existante | E2E | Connecté, naviguer vers la page d'un livre déjà noté, changer la note | Nouvelle note affichée, moyenne recalculée | Entrée `Rate` mise à jour avec la nouvelle valeur | |

### 7.5 Profil utilisateur

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Modification du nom d'utilisateur | E2E | Connecté, naviguer vers `/profil`, changer le pseudo, sauvegarder | Nouveau pseudo affiché dans le profil et la navbar | Champ `username` mis à jour dans `User` | |
| Upload d'une photo de profil valide | E2E | Connecté, naviguer vers `/profil`, uploader une image jpg valide (≤ 5 Mo) | Nouvelle photo affichée dans le profil | Champ `profilePicture` mis à jour dans `User`, fichier présent dans `uploads/profiles/` | |
| Accès au profil privé d'un autre utilisateur sans connexion | E2E | Non connecté, naviguer vers le profil d'un utilisateur dont `isPublic: false` | Redirection ou page 403 affichée | Aucune donnée personnelle exposée | |

### 7.6 Interface d'administration (Backoffice)

| Scénario | Type | Actions navigateur | Résultat attendu (UI) | Vérification base de données | Statut |
| --- | --- | --- | --- | --- | --- |
| Accès au backoffice sans rôle admin | E2E | Connecté en tant qu'utilisateur simple, naviguer vers `/backoffice` | Redirection vers une page 403 ou la page d'accueil | Aucune modification en base | |
| Modération d'un commentaire — approbation | E2E | Connecté en tant qu'admin, naviguer vers la liste des commentaires à modérer, approuver un commentaire | Commentaire retiré de la liste de modération | `Comment.status` mis à jour à `APPROVED` en base | |
| Modération d'un commentaire — rejet | E2E | Connecté en tant qu'admin, rejeter un commentaire | Commentaire retiré de la liste de modération | `Comment.status` mis à jour à `REJECTED` en base | |
| Promotion d'un utilisateur en admin | E2E | Connecté en tant qu'admin, naviguer vers la liste des utilisateurs, promouvoir un utilisateur | Rôle affiché comme `ADMIN` dans la liste | `User.role` mis à jour à `ADMIN` en base | |
| Suppression d'un utilisateur par un admin | E2E | Connecté en tant qu'admin, supprimer un compte utilisateur depuis le backoffice | Utilisateur retiré de la liste | Entrée supprimée de la table `User`, `UserBook`, `Comment` et `Rate` associés supprimés en cascade | |

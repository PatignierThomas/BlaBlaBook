# cda-blablabook

## Instalation

add .env

run npm i

run npx prisma migrate dev

## Neon

- Récupérer l'url de la database Neon
- Remplacement la DATABASE_URL dans le .env et dans le docker compose
- Relancer le docker afin qu'il prenne en compte la nouvelle URL
- Si c'est la 1ère fois :
  --> dans le container back end : npx prisma generate + npx prisma db push + npx prisma db seed



## CI/CD

VPS_HOST = patignierthomas-server.eddi.cloud
VPS_PORT = 22
VPS_USER = student

// chargement du dump
docker compose -f docker-compose.prod.yml up 
docker compose -f docker-compose.prod.yml up -d --build
docker exec -i $(docker compose -f docker-compose.prod.yml ps -q database) psql -U blablabook_user -d blablabook_db < dumpSql/complete.sql
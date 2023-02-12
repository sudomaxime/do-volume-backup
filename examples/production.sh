## Push example

docker run \
-e DO_SPACE_KEY='YOUR_DO_SPACE_KEY_HERE' \
-e DO_SPACE_SECRET='YOUR_DO_SPACE_SECRET_HERE' \
-v YOUR_BACKUP_VOLUME_NAME_HERE:/push \
docker.pkg.github.com/sudomaxime/do-spaces-docker-volume-backup/backup-tool:latest \
push --endpoint YOUR_DO_SPACE_ENDPOINT --bucket YOUR_DO_BUCKET_NAME --folder YOUR_DESIRED_BACKUP_NAME; \
history -d $(history 1)

## Pull (you need a download token)

docker run \
-e DO_SPACE_KEY='YOUR_DO_SPACE_KEY_HERE' \
-e DO_SPACE_SECRET='YOUR_DO_SPACE_SECRET_HERE' \
-v YOUR_BACKUP_VOLUME_NAME_HERE:/pull \
docker.pkg.github.com/sudomaxime/do-spaces-docker-volume-backup/backup-tool:latest \
push --endpoint YOUR_DO_SPACE_ENDPOINT --bucket YOUR_DO_BUCKET_NAME --folder YOUR_DESIRED_BACKUP_NAME; \
history -d $(history 1)
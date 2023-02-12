# Backup and restore any docker volume using digital ocean spaces
This is a terminal tool that helps you create volume backups and store them in a
[digital ocean spaces](https://www.digitalocean.com/products/spaces). These backups can
be retrieved or shared with other users using the same tool.

This solution has been created to scratch my itch of being able to grab a volume from production to my
local machine in development without having to check for available disk space or risking to clog the
remote machine disk with heavy local backups.

This is very usefull to grab a Dockerized CMS upload folder, quickly copy a MYSQL database without having
to run exportations or simply sharing your local development database/files/volumes with a coworker.

Althought it is safe to use it in this manner, this tool on it's own is not intended for critical production server backups, 
if you wish to do that please read the warning section before using in production.

**Some key points**: 
* Does not require free disk space to generate the backup as tar file is streamed directly to your bucket at the same time it is being compressed, chunk by chunk
* Allows you to backup very large volumes without hitting memory limits on low memory devices or cheap servers
* Automatically timestamps backup tar files to prevent overwriting
* Simple to use and understand configurations and error messages
* Leverages the cheap and virtually limitless storage of spaces bucket
* Can be integrated easily in a CI/CD pipeline or an automatic backup script
* Doesn't leak api keys or secrets in server history (see examples)

## System requirements
The only requirement to run this terminal tool is having [docker installed on your machine](https://www.docker.com/).

## Warning before using
**ALWAYS TESTS BACKUPS IN DEVELOPMENT BEFORE RELYING ON THIS TOOL IN PRODUCTION !**

If you find yourself using this repository to backup or restore a volume on a production server, make sure you understand what this tool does. You will need to use other scripts and pipelines to ensure that your critical files are not consumed by another process while being copied.

Streaming files as they are being used by another process can create inconsistencies and file corruptions, ensure that the volume you are backuping is not being used by a service, use your best judgement here.

For file restorations, the same concerns apply, make sure that your volume is not being used by another process as all the current files will be deleted and replaced.

To use this in production in a safe way, here are three solutions:
1. Create a CI/CD script that closes all other services that consumes the volume you wish to backup before starting a backup using this tool, once the backup is finished, restart the services that uses this volume. This can be done easily with docker swarm, kubernetes or bash scripts. This solution is the best overall solution as you do not need extraneous space on your disk to create a local backup copy and is by far the easiest to operate.
2. Copy your docker volume to a new volume using rsync `sudo rsync -a /var/lib/docker/volumes/source_volume /var/lib/docker/volumes/target_volume` once the sync is finished, safely backup the copied volume with this tool as it is not currently being used by a process, then delete the copied volume. This solution is easy to operate, but will use disk space.
3. If you wish to save disk space, you can rsync your volume to a different server using SSH and execute the backup from that remote machine.

In production we strongly reccomend adding `history -d $(history 1)` to remove all traces of your digital ocean secret keys in the server history file.

## Required params
Running the `pull` or `push` will require three parameters, these are used by the program to know where files should be saved.
* `-e, --endpoint` Specify the Digital Ocean endpoint (ex: nyc3.digitaloceanspaces.com)
* `-b, --bucket` Specify the bucket name of your spaces
* `-n, --name` Give a name for your backup (ex: my-app-mysql-backup) it will automatically append a unique timestamp to prevent overwriting a backup of the same name.

## Command examples
**push example**:
```bash
docker run \
-e DO_SPACE_KEY='YOUR_DO_SPACE_KEY_HERE' \
-e DO_SPACE_SECRET='YOUR_DO_SPACE_SECRET_HERE' \
-v YOUR_BACKUP_VOLUME_NAME_HERE:/push \
ghcr.io/sudomaxime/do-volume-backup:latest \
push --endpoint YOUR_DO_SPACE_ENDPOINT --bucket YOUR_DO_BUCKET_NAME --name YOUR_DESIRED_BACKUP_NAME; \
history -d $(history 1)
```

**pull example**:
```bash
docker run \
-e DO_SPACE_KEY='YOUR_DO_SPACE_KEY_HERE' \
-e DO_SPACE_SECRET='YOUR_DO_SPACE_SECRET_HERE' \
-v YOUR_BACKUP_VOLUME_NAME_HERE:/pull \
ghcr.io/sudomaxime/do-volume-backup:latest \
push --endpoint YOUR_DO_SPACE_ENDPOINT --bucket YOUR_DO_BUCKET_NAME --name YOUR_DESIRED_BACKUP_NAME; \
history -d $(history 1)
```

*Note: we use `history -d $(history 1)` to prevent leaking secrets in server history logs, this is considered a good practice.*

## Working in development
In development mode, you will need to create an environment file `.env` with the variables found in the previous section. These variables can also be found in the docker-compose file, as a reference.

The next step to test downloading and uploading is to create a temporary folder on your machine and use it as a docker volume.

By default these two folders are placed in the root directory of the project:
* `test_download` - A folder that will recieve files from the pull command
* `test_upload` - A folder to service the files to the bucket using the push command

We do not reccomend changing these test folder directories as they are hardcoded in the docker-compose file for convienence.

To run the program simply type `docker-compose run service` and let docker handle all the trouble for you.

## Development .env
These variables can be used in development:
* `NODE_ENV=development` - Either `development` or `production`.
* `DO_SPACE_KEY=<your_bucket_key>` - Your private space key, starting with 'DO' followed by 18 alphanumeric characters
* `DO_SPACE_SECRET=<your_bucket_secret>` - Your digital ocean secert key
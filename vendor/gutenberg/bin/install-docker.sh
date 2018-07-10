#!/bin/bash

# Exit if any command fails
set -e

# Include useful functions
. "$(dirname "$0")/includes.sh"

# Check that Docker is installed
if ! command_exists "docker"; then
	echo -e $(error_message "Docker doesn't seem to be installed. Please head on over to the Docker site to download it: $(action_format "https://www.docker.com/community-edition#/download")")
	exit 1
fi

# Check that Docker is running
if ! docker info >/dev/null 2>&1; then
	echo -e $(error_message "Docker isn't running. Please check that you've started your Docker app, and see it in your system tray.")
	exit 1
fi

# Stop existing containers
echo -e $(status_message "Stopping Docker containers...")
docker-compose down --remove-orphans >/dev/null 2>&1

# Download image updates
echo -e $(status_message "Downloading Docker image updates...")
docker-compose pull

# Launch the containers
echo -e $(status_message "Starting Docker containers...")
docker-compose up -d >/dev/null

HOST_PORT=$(docker-compose port wordpress 80 | awk -F : '{printf $2}')

# Wait until the docker containers are setup properely
echo -en $(status_message "Attempting to connect to wordpress...")
until $(curl -L http://localhost:$HOST_PORT -so - 2>&1 | grep -q "WordPress"); do
    echo -n '.'
    sleep 5
done
echo ''

# Install WordPress
echo -e $(status_message "Installing WordPress...")
docker-compose run --rm -u 33 cli core install --url=localhost:$HOST_PORT --title=Gutenberg --admin_user=admin --admin_password=password --admin_email=test@test.com >/dev/null
# Check for WordPress updates, just in case the WordPress image isn't up to date.
docker-compose run --rm -u 33 cli core update >/dev/null

# If the 'wordpress' volume wasn't during the down/up earlier, but the post port has changed, we need to update it.
CURRENT_URL=$(docker-compose run -T --rm cli option get siteurl)
if [ "$CURRENT_URL" != "http://localhost:$HOST_PORT" ]; then
	docker-compose run --rm cli option update home "http://localhost:$HOST_PORT" >/dev/null
	docker-compose run --rm cli option update siteurl "http://localhost:$HOST_PORT" >/dev/null
fi

# Activate Gutenberg
echo -e $(status_message "Activating Gutenberg...")
docker-compose run --rm cli plugin activate gutenberg >/dev/null

# Install the PHPUnit test scaffolding
echo -e $(status_message "Installing PHPUnit test scaffolding...")
docker-compose run --rm wordpress_phpunit /app/bin/install-wp-tests.sh wordpress_test root example mysql latest false >/dev/null

# Install Composer
echo -e $(status_message "Installing and updating Composer modules...")
docker-compose run --rm composer install

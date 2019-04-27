#!/bin/bash
set -e

# This file is run for the Docker image defined in Dockerfile.
# These commands will be run each time the container is run.
#
# If you modify anything here, remember to build the image again by running:
# yarn docker:build-image

user="${APACHE_RUN_USER:-www-data}"
group="${APACHE_RUN_GROUP:-www-data}"

# Download WordPress
[ -f /var/www/html/xmlrpc.php ] || wp --allow-root core download

# Configure WordPress
if [ ! -f /var/www/html/wp-config.php ]; then
	echo "Creating wp-config.php ..."
	# Loop until wp cli exits with 0
	# because if running the containers for the first time,
	# the mysql container will reject connections until it has set the database data
	# See "No connections until MySQL init completes" in https://hub.docker.com/_/mysql/
	times=15
	i=1
	while [ "$i" -le "$times" ]; do
		sleep 3
		wp --allow-root config create \
			--dbhost=${MYSQL_HOST} \
			--dbname=${MYSQL_DATABASE} \
			--dbuser=${MYSQL_USER} \
			--dbpass=${MYSQL_PASSWORD} \
			&& break
		[ ! $? -eq 0 ] || break;
		echo "Waiting for creating wp-config.php until mysql is ready to receive connections"
		(( i++ ))
	done

	echo "Setting other wp-config.php constants..."
	wp --allow-root config set WP_DEBUG true --raw --type=constant
	wp --allow-root config set WP_DEBUG_LOG true --raw --type=constant
	wp --allow-root config set WP_DEBUG_DISPLAY false --raw --type=constant

	# Respecting Dockerfile-forwarded environment variables
	# Allow to be reverse-proxied from https
	wp --allow-root config set "_SERVER['HTTPS']" "isset( \$_SERVER['HTTP_X_FORWARDED_PROTO'] ) && \$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ? 'on' : NULL" \
		--raw \
		--type=variable

	# Allow this installation to run on http or https.
	wp --allow-root config set DOCKER_REQUEST_URL \
		"( ! empty( \$_SERVER['HTTPS'] ) ? 'https://' : 'http://' ) . ( ! empty( \$_SERVER['HTTP_HOST'] ) ? \$_SERVER['HTTP_HOST'] : 'localhost' )" \
		--raw \
		--type=constant
	wp --allow-root config set WP_SITEURL "DOCKER_REQUEST_URL" --raw --type=constant
	wp --allow-root config set WP_HOME "DOCKER_REQUEST_URL" --raw --type=constant
fi

# Copy single site htaccess if none is present
if [ ! -f /var/www/html/.htaccess ]; then
	cp /tmp/htaccess /var/www/html/.htaccess
fi

# If we don't have the wordpress test helpers, download them
if [ ! -d /tmp/wordpress-develop/tests ]; then
	# Get latest WordPress unit-test helper files
	svn co \
		https://develop.svn.wordpress.org/trunk/tests/phpunit/data \
		/tmp/wordpress-develop/tests/phpunit/data \
		--trust-server-cert \
		--non-interactive
	svn co \
		https://develop.svn.wordpress.org/trunk/tests/phpunit/includes \
		/tmp/wordpress-develop/tests/phpunit/includes \
		--trust-server-cert \
		--non-interactive
fi

# Create a wp-tests-config.php if there's none currently
if [ ! -f /tmp/wordpress-develop/wp-tests-config.php ]; then
	cp /tmp/wp-tests-config.php /tmp/wordpress-develop/wp-tests-config.php
fi

WP_HOST_PORT=":$HOST_PORT"

if [ 80 -eq "$HOST_PORT" ]; then
	WP_HOST_PORT=""
fi

echo
echo "Open http://${WP_DOMAIN}${WP_HOST_PORT}/ to see your site!"
echo

# Run apache in the foreground so the container keeps running
echo "Running Apache in the foreground"
apachectl -D FOREGROUND

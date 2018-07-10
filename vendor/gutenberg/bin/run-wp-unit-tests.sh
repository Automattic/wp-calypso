#!/usr/bin/env bash

cd "$(dirname "$0")/../"

export PATH="$HOME/.composer/vendor/bin:$PATH"
if [[ $DOCKER = "true" ]]; then
	bin/setup-local-env.sh
else
	bash bin/install-wp-tests.sh wordpress_test root '' localhost $WP_VERSION
	source bin/install-php-phpunit.sh

	# Run the build because otherwise there will be a bunch of warnings about
	# failed `stat` calls from `filemtime()`.
	composer install || exit 1
	npm install || exit 1
fi

npm run build || exit 1

# Make sure phpegjs parser is up to date
node bin/create-php-parser.js || exit 1
if ! git diff --quiet --exit-code lib/parser.php; then
	echo 'ERROR: The PEG parser has been updated, but the generated PHP version'
	echo '       (lib/parser.php) has not.  Run `bin/create-php-parser.js` and'
	echo '       commit the resulting changes to resolve this.'
	sleep .2 # Otherwise Travis doesn't want to print the whole message
	exit 1
fi

echo Running with the following versions:
if [[ $DOCKER = "true" ]]; then
	docker-compose run --rm wordpress_phpunit php -v
	docker-compose run --rm wordpress_phpunit phpunit --version
else
	php -v
	phpunit --version
fi

# Check parser syntax
php lib/parser.php || exit 1

# Run PHPUnit tests
if [[ $DOCKER = "true" ]]; then
	npm run test-php || exit 1
	npm run test-unit-php-multisite || exit 1
else
	phpunit || exit 1
	WP_MULTISITE=1 phpunit || exit 1
fi

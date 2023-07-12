#!/bin/bash
set -Eeuo pipefail

if [ ! -f "./editing-toolkit-plugin/newspack-blocks/synced-newspack-blocks/class-newspack-blocks.php" ] ; then
	echo "Synced newspack-blocks directory doesn't exist. ETK needs to be built for this check to work."
	exit 1
fi

if [ ! -f "./editing-toolkit-plugin/starter-page-templates/dist/starter-page-templates.min.js" ] ; then
	echo "ETK's JS files have not been built. ETK needs to be built for this check to work."
	exit 1
fi

set +e
eslint_result=$(npx eslint-nibble --no-interactive --rule '@wordpress/i18n-text-domain' .)
set -e

if ! grep "No lint failures found for rule(s): @wordpress/i18n-text-domain" <<< "$eslint_result" ; then
	echo "$eslint_result"
	exit 1
fi

set +e
phpcs_result=$(../../vendor/bin/phpcs --extensions=php --standard=./bin/i18n-phpcs-check.xml -p ./)
phpcs_exit_code=$?
set -e

# Check that we actually linted all the PHP files.
num_php_files=$(find . -type f -name '*.php' | wc -l | xargs)
num_str="$num_php_files / $num_php_files"
if ! grep "$num_str" <<< "$phpcs_result" ; then
	echo "PHPCS probably didn't run."
	exit 1
fi

if [ "$phpcs_exit_code" -eq 0 ] ; then
	echo "Everything appears to have the correct text domain."
	exit 0
fi

# Automatically fail unless we detect success.
exit 1

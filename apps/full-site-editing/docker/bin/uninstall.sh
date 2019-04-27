#!/bin/bash

# Empty DB
wp --allow-root db reset --yes

# Ensure we have single-site htaccess instead of multisite,
# just like we would have in fresh container.
cp -f /tmp/htaccess /var/www/html/.htaccess

# Remove "uploads" and "upgrade" folders
rm -fr /var/www/html/wp-content/uploads /var/www/html/wp-content/upgrade

# Empty WP debug log
truncate -s 0 /var/www/html/wp-content/debug.log

# Ensure wp-config.php doesn't have multi-site settings
echo
echo "Clearing out possible multi-site related settings from wp-config.php"
echo "It's okay to see errors if these did't exist..."
wp --allow-root config delete WP_ALLOW_MULTISITE
wp --allow-root config delete MULTISITE
wp --allow-root config delete SUBDOMAIN_INSTALL
wp --allow-root config delete base
wp --allow-root config delete DOMAIN_CURRENT_SITE
wp --allow-root config delete PATH_CURRENT_SITE
wp --allow-root config delete SITE_ID_CURRENT_SITE
wp --allow-root config delete BLOG_ID_CURRENT_SITE

echo
echo "WordPress uninstalled. To install it again, run:"
echo
echo "  yarn docker:install"
echo

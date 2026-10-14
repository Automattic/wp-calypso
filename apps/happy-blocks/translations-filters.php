<?php
/**
 * Script-translation filters shared by all happy-blocks scripts.
 *
 * Kept in its own file, separate from index.php, because it needs to be loaded
 * from two independent places that don't otherwise share code:
 *   - wp-content/a8c-plugins/happy-blocks/index.php, for *.support.wordpress.com /
 *     Learn / developer blogs (see wp-content/mu-plugins/support-plugin-helpers.php).
 *   - wp-content/mu-plugins/wpcom-bbpress.php, for bbPress support-forum blogs
 *     (e.g. *.forums.wordpress.com), which load block-library/pricing-plans/index.php
 *     directly and never load the rest of this plugin.
 * Without this split, bbPress forum blogs would register the pricing-plans block
 * (it has its own "textdomain": "happy-blocks" in block.json) but never register
 * the filters that make its translations actually resolve - so WordPress core
 * would silently look in the wrong place and fall back to English.
 *
 * @package happy-blocks
 */

// no-strict-types old code split from index.php, which does not use strict typing.

/**
 * Returns the current site locale.
 */
function happy_blocks_get_site_locale() {
	$lang = get_blog_lang_code( get_current_blog_id() );
	return $lang;
}

/**
 * Return the correct asset relative path to determine the translation file name,
 * when loading the translation files from wp.com CDN.
 *
 * @param string|false $relative The relative path of the script. False if it could not be determined.
 * @param string       $src      The full source URL of the script.
 * @return string|false          The new relative path
 */
function happyblocks_normalize_translations_relative_path( $relative, $src ) {
	// Rewrite our CDN path to a relative path to calculate the right filename.
	if ( preg_match( '#/wp-content/a8c-plugins/happy-blocks/(.*\.js)#', $src, $m ) ) {
		// Fix the path to support `yarn dev --sync`.
		$relative = str_replace( 'build/', '', $m[1] );

		// Remove rtl segment from the relative path to prevent encoding incorrect $md5_filename for the script translations.
		$relative = str_replace( '/rtl/../', '/', $relative );

		return $relative;
	}
	return $relative;
}
add_filter( 'load_script_textdomain_relative_path', 'happyblocks_normalize_translations_relative_path', 10, 2 );

/**
 * Adjust the file path for loading script translations to match the files structure on WordPress.com
 *
 * @param string|false $file   Path to the translation file to load. False if there isn't one.
 * @param string       $handle Name of the script to register a translation domain to.
 * @param string       $domain The text domain.
 */
function happyblocks_normalize_translations_filepath( $file, $handle, $domain ) {
	if ( ! $file ) {
		return $file;
	}
	if ( 'happy-blocks' === $domain ) {
		// Translation files for happy-blocks are published flat under WP_LANG_DIR/a8c-plugins/
		$file = WP_LANG_DIR . '/a8c-plugins/' . basename( $file );

		// happy blocks use the site's own locale, not the visitor's. Core may already agree (it
		// resolves locale-aware routes correctly on most requests) or may not - determine_locale()
		// runs before the load_script_textdomain_relative_path filter this plugin also hooks, so a
		// same-request locale override registered there is always a step too late to affect $file's
		// name. Correct it here either way, since this filter fires after the filename is built.
		$resolved_locale = determine_locale();
		$site_locale     = happy_blocks_get_site_locale();
		if ( $site_locale && $resolved_locale !== $site_locale ) {
			$file = str_replace( "happy-blocks-{$resolved_locale}-", "happy-blocks-{$site_locale}-", $file );
		}
	}
	return $file;
}
add_filter( 'load_script_translation_file', 'happyblocks_normalize_translations_filepath', 10, 3 );

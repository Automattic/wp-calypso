<?php
/**
 * Plugin Name: Happy Blocks
 * Version:     0.1.0
 * Description: Happiness Engineering Specific Blocks
 * Author: A8C
 * Text Domain: happy-blocks
 *
 * @package happy-blocks
 *
 * Instructions:
 *   1. The block code is found in Calypso in `apps/happy-blocks` - see the README there for
 *      information on how to edit and maintain them.
 *      https://github.com/Automattic/wp-calypso/tree/trunk/apps/happy-blocks
 *
 *   2. The block code is built from a TeamCity job in Calypso
 *
 *      https://github.com/Automattic/wp-calypso/blob/813bc5bc8a5e21593f05a68c76b02b9827a680f1/.teamcity/_self/projects/WPComPlugins.kt#L116
 *
 *      It's built on every Calypso deploy. Why not just the ones where we modify happy-blocks?
 *      Changes to Calypso's components, build system, and framework may indirectly change
 *      the build of these blocks. We expect to update code here on every change to the
 *      happy-blocks code but it's safe and normal from time to time to go ahead and rebuild the
 *      blocks to capture ancillary work going on in general.
 *
 *   3. Login to your sandbox and fetch the updated block code with the install-plugins.sh script
 *
 *      ```
 *      # Prep the latest trunk build for release
 *      wpdev~/public_html# install-plugin.sh happy-blocks --release
 *
 *      # Alternatively, load changes from a branch (e.g. to test a PR.)
 *      ```
 *      wpdev~/public_html# install-plugin.sh happy-blocks $brach_name
 *      ```
 */

/**
 * Load Pricing Plans Block
 */
require_once __DIR__ . '/block-library/pricing-plans/index.php';

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
	// happy blocks use the site language, not the user language.
	if ( stripos( $src, 'a8c-plugins/happy-blocks' ) !== false ) {
		add_filter( 'determine_locale', 'happy_blocks_get_site_locale' );
	} else {
		remove_filter( 'determine_locale', 'happy_blocks_get_site_locale' );
	}
	// Rewrite our CDN path to a relative path to calculate the right filename.
	if ( preg_match( '#/wp-content/a8c-plugins/happy-blocks/(.*\.js)#', $src, $m ) ) {
		// Fix the path to support `yarn dev --sync`.
		$relative = str_replace( 'build/', '', $m[1] );

		// Remove rtl segment from the relative path to prevent encoding incorrect $md5_filename for the script translations.
		$relative = str_replace( '/rtl/../', '/', $m[1] );

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
	// Fix the filepath to use the correct location for the translation file.
	if ( 'happy-blocks' === $domain ) {
		$old_path = WP_LANG_DIR . '/happy-blocks';
		$new_path = WP_LANG_DIR . '/a8c-plugins/happy-blocks';
		$file     = str_replace( $old_path, $new_path, $file );
	}
	return $file;
}
add_filter( 'load_script_translation_file', 'happyblocks_normalize_translations_filepath', 10, 3 );

/**
 * Allow SVG, select and input tags in the footer.
 *
 * @param array $tags Allowed tags, attributes, and/or entities.
 * @return array
 */
function happyblocks_allow_footer_tags( $tags ) {
	$tags['svg']    = array(
		'xmlns'       => array(),
		'fill'        => array(),
		'viewbox'     => array(),
		'role'        => array(),
		'aria-hidden' => array(),
		'focusable'   => array(),
		'class'       => array(),
	);
	$tags['path']   = array(
		'd'    => array(),
		'fill' => array(),
	);
	$tags['select'] = array(
		'class' => array(),
		'title' => array(),
	);
	$tags['option'] = array(
		'value'    => array(),
		'disabled' => array(),
		'lang'     => array(),
	);
	$tags['stop']   = array(
		'stopColor' => array(),
		'offset'    => array(),
	);
	$tags['defs']   = array();

	$tags['footer'] = array_merge(
		$tags['footer'] ?? array(),
		array(
			'data-locale' => array(),
		)
	);

	return $tags;
}

add_filter(
	'wp_kses_allowed_html',
	'happyblocks_allow_footer_tags',
	10,
	2
);

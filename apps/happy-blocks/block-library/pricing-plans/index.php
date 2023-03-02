<?php
/**
 * Block Name:  Pricing Plans
 * Description: Provides an upgrade option to different plans. Used on wordpress.com/forums.
 * Author:      Lighthouse
 *
 * @package pricing-plans
 */

/**
 * Load the necessary config data.
 *
 * @return void
 */
function happyblocks_pricing_plans_enqueue_config_data() {
	wp_register_script( 'a8c-happyblocks-pricing-plans', '', array(), '20221212', true );
	wp_enqueue_script( 'a8c-happyblocks-pricing-plans' );
	wp_add_inline_script(
		'a8c-happyblocks-pricing-plans',
		sprintf(
			'window.A8C_HAPPY_BLOCKS_CONFIG = %s;
			window.configData ||= {};',
			wp_json_encode( happyblocks_pricing_plans_get_config() )
		),
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'happyblocks_pricing_plans_enqueue_config_data' );
add_action( 'wp_enqueue_scripts', 'happyblocks_pricing_plans_enqueue_config_data' );

/**
 * Decide if the current logged in user is the topic author.
 *
 * @return bool true if the current user is the topic author, false otherwise.
 */
function happyblocks_pricing_plans_is_author() {

	// If the user is not authenticated, then we can't get their domain.
	if ( ! is_user_logged_in() ) {
		return false;
	}

	// If BBPress is not active, we can't tell if the current user is the author.
	if ( ! function_exists( 'bbp_get_topic_id' ) ) {
		return false;
	}

	$topic_id  = bbp_get_topic_id();
	$author_id = intval( get_post_field( 'post_author', $topic_id ) );

	return get_current_user_id() === $author_id;
}

/**
 * Get the pricing plans configuration
 *
 * @return array
 */
function happyblocks_pricing_plans_get_config() {

	return array(
		'features' => array(),
		'locale'   => get_user_locale(),
	);
}

/**
 * Render happy-tools/pricing-plans block view placeholder.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function happyblocks_pricing_plans_render_callback( $attributes ) {
	// The domain should be set to false instead of null when not available, see https://github.com/Automattic/wp-calypso/pull/70402#discussion_r1033299970.
	$attributes['domain'] = happyblocks_pricing_plans_is_author() ? $attributes['domain'] : false;

	$json_attributes = htmlspecialchars( wp_json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );

	return <<<HTML
		<div data-attributes="${json_attributes}" class="a8c-happy-tools-pricing-plans-block-placeholder" />
HTML;
}

/**
 * Return the correct asset relative path to determine the translation file name,
 * when loading the translation files from wp.com CDN.
 *
 * @param string|false $relative The relative path of the script. False if it could not be determined.
 * @param string       $src      The full source URL of the script.
 * @return string|false          The new relative path
 */
function happyblocks_pricing_plans_normalize_translations_relative_path( $relative, $src ) {
	// Rewrite our CDN path to a relative path to calculate the right filename.
	if ( preg_match( '#https?://s[0123]\.wp\.com/wp-content/a8c-plugins/happy-blocks/(block-library.*\.js)#', $src, $m ) ) {
		return $m[1];
	}
	return $relative;
}
add_filter( 'load_script_textdomain_relative_path', 'happyblocks_pricing_plans_normalize_translations_relative_path', 10, 2 );

/**
 * Adjust the file path for loading script translations to match the files structure on WordPress.com
 *
 * @param string|false $file   Path to the translation file to load. False if there isn't one.
 * @param string       $handle Name of the script to register a translation domain to.
 * @param string       $domain The text domain.
 */
function happyblocks_pricing_plans_normalize_translations_filepath( $file, $handle, $domain ) {
	if ( ! $file ) {
		return $file;
	}
	// Fix the filepath to use the correct location for the translation file.
	if ( 'happy-blocks' === $domain ) {
		$languages_path = '/home/wpcom/public_html/wp-content/languages/';
		$old_path       = $languages_path . 'happy-blocks';
		$new_path       = $languages_path . 'a8c-plugins/happy-blocks';
		$file           = str_replace( $old_path, $new_path, $file );
	}
	return $file;
}
add_filter( 'load_script_translation_file', 'happyblocks_pricing_plans_normalize_translations_filepath', 10, 3 );

/**
 * Register happy-blocks.
 */
function happyblocks_pricing_plan_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/build/rtl' : '/build' ),
		array(
			'render_callback' => 'happyblocks_pricing_plans_render_callback',
		)
	);
}

add_action( 'init', 'happyblocks_pricing_plan_register' );

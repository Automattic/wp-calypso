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
 * Load editor assets.
 */
function a8c_happyblocks_assets() {
	$assets = require_once plugin_dir_path( __FILE__ ) . 'dist/editor.min.asset.php';

	wp_register_script( 'a8c-happyblocks-pricing-plans', '', array(), '1', true );
	wp_enqueue_script( 'a8c-happyblocks-pricing-plans' );
	wp_add_inline_script(
		'a8c-happyblocks-pricing-plans',
		sprintf(
			'window.A8C_HAPPY_BLOCKS_CONFIG = %s;',
			wp_json_encode( a8c_happyblocks_get_config() )
		),
		'before'
	);

	wp_enqueue_script(
		'a8c-happyblocks-js',
		plugins_url( 'dist/editor.min.js', __FILE__ ),
		array_merge( $assets['dependencies'], array( 'a8c-happyblocks-pricing-plans' ) ),
		$assets['version'],
		true
	);

	$style_file = 'dist/editor' . ( is_rtl() ? '.rtl.css' : '.css' );
	wp_enqueue_style(
		'a8c-happyblocks-edit-css',
		plugins_url( $style_file, __FILE__ ),
		array( 'wp-edit-blocks' ),
		$assets['version']
	);
}

/**
 * Load front-end view assets.
 */
function a8c_happyblocks_view_assets() {
		$assets = require plugin_dir_path( __FILE__ ) . 'dist/view.min.asset.php';

		$style_file = 'dist/view' . ( is_rtl() ? '.rtl.css' : '.css' );
		wp_enqueue_style(
			'a8c-happyblock-view-css',
			plugins_url( $style_file, __FILE__ ),
			array(),
			$assets['version']
		);

		$script_file = 'dist/view.js';
		wp_enqueue_script(
			'a8c-happyblock-view-js',
			plugins_url( $script_file, __FILE__ ),
			array( 'wp-element' ),
			$assets['version'],
			true
		);
}
add_action( 'enqueue_block_editor_assets', 'a8c_happyblocks_assets' );
add_action( 'wp_enqueue_scripts', 'a8c_happyblocks_view_assets' );

/**
 * Get the pricing plans configuration
 *
 * @return array
 */
function a8c_happyblocks_get_config() {
	$domain = wp_parse_url( get_site_url() )['host'];
	return array(
		'domain' => $domain,
		'locale' => get_user_locale(),
	);
}

/**
 * Render happy-tools/pricing-plans block view placeholder.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function a8c_happyblocks_render_pricing_plans_callback( $attributes ) {
	$json_attributes = htmlspecialchars( wp_json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );

	return <<<HTML
		<div data-attributes="${json_attributes}" class="a8c-happy-tools-pricing-plans-block-placeholder" />
HTML;

}

/**
 * Register happy-blocks.
 */
function a8c_happyblocks_register() {
	register_block_type(
		'happy-blocks/pricing-plans',
		array(
			'api_version'     => 2,
			'render_callback' => 'a8c_happyblocks_render_pricing_plans_callback',
		)
	);

}
add_action( 'init', 'a8c_happyblocks_register' );

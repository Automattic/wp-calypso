<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded in the block editor.
 *
 * Currently, this module may not be the best place if you need to load
 * front-end assets, but you could always add a separate action for that.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\EditorSiteLaunch;

/**
 * Enqueue launch button assets
 *
 * @param array $site_launch_options Site launch options.
 */
function enqueue_launch_button_script_and_style( $site_launch_options ) {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/launch-button.asset.php';
	$script_file         = 'dist/launch-button.js';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . $script_file );

	wp_enqueue_script(
		'a8c-fse-editor-site-launch-button-script',
		plugins_url( $script_file, __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	$style_file    = 'dist/launch-button' . ( is_rtl() ? '.rtl.css' : '.css' );
	$style_version = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . $style_file );
	wp_enqueue_style(
		'a8c-fse-editor-site-launch-button-style',
		plugins_url( $style_file, __FILE__ ),
		array(),
		$style_version
	);

	// Pass site launch options to client side here.
	// This is accessible via window.wpcomEditorSiteLaunch.
	wp_localize_script(
		'a8c-fse-editor-site-launch-button-script',
		'wpcomEditorSiteLaunch',
		array(
			'siteSlug'        => $site_launch_options['site_slug'],
			'launchUrl'       => $site_launch_options['launch_url'],
			'launchFlow'      => $site_launch_options['launch_flow'],
			'isGutenboarding' => $site_launch_options['is_gutenboarding'],
			'locale'          => determine_locale(),
		)
	);
}

/**
 * Enqueue launch flow assets
 *
 * @param array $site_launch_options Site launch options.
 */
function enqueue_launch_flow_script_and_style( $site_launch_options ) {

	$launch_flow = $site_launch_options['launch_flow'];

	// Determine script name by launch flow.
	// We are avoiding string concatenation for security reasons.
	switch ( $launch_flow ) {
		case 'gutenboarding-launch':
			$script_name = 'gutenboarding-launch';
			break;
		case 'focused-launch':
			$script_name = 'focused-launch';
			break;
		case 'launch-site':
			// @TODO: this is just temporary for testing via feature flag. Remove it once focused-launch is live
			$script_name = 'focused-launch';
			break;
		default:
			// For redirect or invalid flows, skip & exit early.
			return;
	}

	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/' . $script_name . '.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_file         = 'dist/' . $script_name . '.js';
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . $script_file );

	wp_enqueue_script(
		'a8c-fse-editor-site-launch-script',
		plugins_url( $script_file, __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_set_script_translations( 'a8c-fse-editor-site-launch-script', 'full-site-editing' );

	$style_file    = 'dist/' . $script_name . ( is_rtl() ? '.rtl.css' : '.css' );
	$style_version = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . $style_file );

	wp_enqueue_style(
		'a8c-fse-editor-site-launch-style',
		plugins_url( $style_file, __FILE__ ),
		array(),
		$style_version
	);
}

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	// Get site launch options.
	$site_launch_options = apply_filters( 'a8c_enable_editor_site_launch', false );

	// If no site launch options, skip.
	// This could mean site is already launched or editing toolkit plugin is running on non-wpcom sites.
	if ( false === $site_launch_options ) {
		return;
	}

	enqueue_launch_button_script_and_style( $site_launch_options );
	enqueue_launch_flow_script_and_style( $site_launch_options );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );

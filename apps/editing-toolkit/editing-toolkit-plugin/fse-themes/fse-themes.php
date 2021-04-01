<?php

function fse_themes_init() {
	add_action( 'load-toplevel_page_fse-themes', 'fse_themes_handle_theme_activations' );
	add_filter( 'site_allowed_themes', 'fse_themes_allow_fse_themes', 10, 2 );

	if ( ! class_exists( 'WP_Interface_Toolkit') ) {
		require_once dirname( __FILE__, 2 ) . '/wp-interface-toolkit/wp-interface-toolkit.php';
	}

	WP_Interface_Toolkit::get_instance()->register_screen(
		'fse-themes',
		[
			'page_title' => 'Themes (FSE)',
			'capability' => 'switch_themes', // @todo match $appearance_cap in wp-admin/menu.php
			'position' => 100,
			'replace' => 'themes.php',
			'data_callback' => 'fse_themes_get_data',
			'script_dir' => plugin_dir_path( __FILE__ ),
			'script_slug' => 'fse-themes',
			'enqueue_callback' => 'fse_theme_enqueue_assets'
		]
	);
}
add_action( 'plugins_loaded', 'fse_themes_init' );

function fse_themes_allow_fse_themes( $allowed_themes, $blog_id ) {
	if ( ! gutenberg_is_fse_theme() ) {
		return $allowed_themes;
	}
	// we have an FSE theme active so let's allow previews
	foreach ( fse_themes_get_fse_themes() as $theme ) {
		$allowed_themes[ $theme->get_stylesheet() ] = 1;
	}
	return $allowed_themes;
}

function fse_themes_get_data() {
	$themes = fse_themes_get_fse_themes();
	$themes = wp_prepare_themes_for_js( $themes );
	$themes = fse_themes_fix_links( $themes );
	return [
		'themes' => $themes
	];
}

function fse_theme_enqueue_assets() {
	//wpcom only
	$thx_url = preg_replace( '|^http:|', 'https:', WPMU_PLUGIN_URL . '/thx/wpcom-thx.css' );
	wp_register_style( 'wpcom-thx', $thx_url, [], '20140116', 'screen' );
	wp_enqueue_style( 'fse-themes', plugins_url( 'src/wit.css', __FILE__ ), ['wpcom-thx'] );
}

function fse_themes_handle_theme_activations() {
	// first, just don't show the notice on our page, we get it
	remove_action( 'admin_notices', 'gutenberg_full_site_editing_notice' );
}

function fse_themes_fix_links( $themes ) {
	// first, let's find the active theme and put it up top
	$key = array_search( true, array_column( $themes, 'active' ) );
	$active_theme = $themes[ $key ];
	unset( $themes[ $key ] );
	$themes = array_merge( [ $active_theme ], $themes );

	foreach ( $themes as $i => $theme ) {
		// activate links are getting encoded, decode them
		$themes[ $i ]['actions']['activate'] = html_entity_decode( $theme['actions']['activate'] );
		// @todo probably stop pointing them to themes.php and handle activation in fse_themes_handle_theme_activations
	}

	return $themes;
}

function fse_themes_get_fse_themes( $use_cache = true ) {
	$transient_key = 'fse_themes_list';
	if ( $use_cache ) {
		$themes = get_transient( $transient_key );
		if ( is_array( $themes ) && ! empty( $themes ) ) {
			return $themes;
		}
	}

	// Because on WP.com we are not network-activating FSE themes to start, we need to get every single theme
	// Beware of trying any other params: we will trigger an infinite loop because this theme list is used in the
	// `site_allowed_themes` filter.
	$all_themes = wp_get_themes();
	$themes = array_filter( $all_themes, function( $theme ){
		return is_readable( $theme->get_stylesheet_directory() . '/block-templates/index.html' );
	} );

	if ( $use_cache && ! empty( $themes ) ) {
		set_transient( $transient_key, $themes, HOUR_IN_SECONDS );
	}
	return $themes;
}


<?php
/**
 * Limit Global Styles on WP.com to paid plans.
 *
 * @package full-site-editing-plugin
 */

/**
 * Checks if Global Styles should be limited on the given site.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether Global Styles are limited.
 */
function wpcom_should_limit_global_styles( $blog_id = 0 ) {
	if ( ! $blog_id ) {
		$blog_id = get_current_blog_id();
	}

	// Do not limit Global Styles on Atomic sites for now, because blog stickers are not exposed
	// to these sites and the project is still in a development stage that requires sites to have
	// a certain blog sticker before restricting the feature. This is a temporary check that will
	// be removed as part of the public launch.
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return false;
	}

	// Do not limit Global Styles on sites created before we made it a paid feature. This cutoff
	// blog ID needs to be updated as part of the public launch.
	if ( $blog_id < 210494207 ) {
		return false;
	}

	if ( wpcom_site_has_feature( WPCOM_Features::GLOBAL_STYLES, $blog_id ) ) {
		return false;
	}

	// During the development stage, we only limit Global Styles on sites that have opted in. This
	// is a temporary check that will be removed as part of the public launch.
	return has_blog_sticker( 'wpcom-limit-global-styles', $blog_id );
}

/**
 * Enqueues the WP.com Global Styles scripts and styles.
 *
 * @return void
 */
function wpcom_global_styles_enqueue_scripts_and_styles() {
	$screen = get_current_screen();
	if ( ! $screen || 'site-editor' !== $screen->id ) {
		return;
	}

	if ( ! wpcom_should_limit_global_styles() ) {
		return;
	}

	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.asset.php';
	$asset        = file_exists( $asset_file )
		? require $asset_file
		: null;
	$dependencies = $asset['dependencies'] ?? array();
	$version      = $asset['version'] ?? filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.min.js' );

	$calypso_domain = 'https://wordpress.com';
	if (
		! empty( $_GET['origin'] ) && // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		in_array(
			$_GET['origin'], // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			array(
				'http://calypso.localhost:3000',
				'https://wpcalypso.wordpress.com',
				'https://horizon.wordpress.com',
			),
			true
		)
	) {
		$calypso_domain = sanitize_text_field( wp_unslash( $_GET['origin'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	$site_slug = method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' )
		? \WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() )
		: wp_parse_url( home_url( '/' ), PHP_URL_HOST );

	wp_enqueue_script(
		'wpcom-global-styles-editor',
		plugins_url( 'dist/wpcom-global-styles.min.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);
	wp_set_script_translations( 'wpcom-global-styles-editor', 'full-site-editing' );
	wp_localize_script(
		'wpcom-global-styles-editor',
		'wpcomGlobalStyles',
		array(
			'assetsUrl'  => plugins_url( 'dist/', __FILE__ ),
			'upgradeUrl' => "$calypso_domain/plans/$site_slug",
		)
	);
	wp_enqueue_style(
		'wpcom-global-styles-editor',
		plugins_url( 'dist/wpcom-global-styles.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'wpcom_global_styles_enqueue_scripts_and_styles' );

/**
 * Returns the stylesheet resulting of merging core and theme data.
 *
 * @return string Stylesheet.
 */
function wpcom_get_free_global_stylesheet() {
	// Return cached value if it can be used and exists.
	$can_use_cached = ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG )
		&& ( ! defined( 'SCRIPT_DEBUG' ) || ! SCRIPT_DEBUG )
		&& ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST )
		&& ! is_admin();

	$transient_name = 'wpcom_free_global_styles_' . get_stylesheet();
	if ( $can_use_cached ) {
		$cached = get_transient( $transient_name );
		if ( $cached ) {
			return $cached;
		}
	}

	$tree                = WP_Theme_JSON_Resolver_Gutenberg::get_merged_data( 'theme' );
	$supports_theme_json = WP_Theme_JSON_Resolver_Gutenberg::theme_has_support();
	if ( ! $supports_theme_json ) {
		$types = array( 'variables', 'styles', 'presets' );
	} else {
		$types = array( 'variables', 'presets', 'base-layout-styles' );
	}

	/*
	 * If variables are part of the stylesheet,
	 * we add them for all origins (default, theme, user).
	 * This is so themes without a theme.json still work as before 5.9:
	 * they can override the default presets.
	 * See https://core.trac.wordpress.org/ticket/54782
	 */
	$styles_variables = '';
	if ( in_array( 'variables', $types, true ) ) {
		$styles_variables = $tree->get_stylesheet( array( 'variables' ) );
		$types            = array_diff( $types, array( 'variables' ) );
	}

	/*
	 * For the remaining types (presets, styles), we do consider origins:
	 *
	 * - themes without theme.json: only the classes for the presets defined by core
	 * - themes with theme.json: the presets and styles classes, both from core and the theme
	 */
	$styles_rest = '';
	if ( ! empty( $types ) ) {
		$origins = array( 'default', 'theme', 'custom' );
		if ( ! $supports_theme_json ) {
			$origins = array( 'default' );
		}
		$styles_rest = $tree->get_stylesheet( $types, $origins );
	}
	$stylesheet = $styles_variables . $styles_rest;
	if ( $can_use_cached ) {
		// Cache for a minute.
		// This cache doesn't need to be any longer, we only want to avoid spikes on high-traffic sites.
		set_transient( $transient_name, $stylesheet, MINUTE_IN_SECONDS );
	}
	return $stylesheet;
}

/**
 * Enqueues the default variation of the global styles.
 */
function wpcom_enqueue_default_global_styles() {
	$separate_assets  = wp_should_load_separate_core_block_assets();
	$is_block_theme   = wp_is_block_theme();
	$is_classic_theme = ! $is_block_theme;

	/*
	 * Global styles should be printed in the head when loading all styles combined.
	 * The footer should only be used to print global styles for classic themes with separate core assets enabled.
	 *
	 * See https://core.trac.wordpress.org/ticket/53494.
	 */
	if (
		( $is_block_theme && doing_action( 'wp_footer' ) ) ||
		( $is_classic_theme && doing_action( 'wp_footer' ) && ! $separate_assets ) ||
		( $is_classic_theme && doing_action( 'wp_enqueue_scripts' ) && $separate_assets )
	) {
		return;
	}

	$stylesheet = wpcom_get_free_global_stylesheet();
	if ( empty( $stylesheet ) ) {
		return;
	}

	wp_register_style( 'wpcom-global-styles', false, array(), true, true );
	wp_add_inline_style( 'wpcom-global-styles', $stylesheet );
	wp_enqueue_style( 'wpcom-global-styles' );
}

/**
 * De-queues Global Styles if the given site is on a free plan.
 *
 * @param  int $blog_id Blog ID.
 */
function wpcom_global_styles_override_for_free_site( $blog_id = 0 ) {
	if ( ! $blog_id ) {
		$blog_id = get_current_blog_id();
	}

	if ( ! wpcom_should_limit_global_styles( $blog_id ) ) {
		return;
	}

	// If the site does not meet the required criteria we override Global Styles with the free version of global styles.
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
	remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
	remove_action( 'wp_enqueue_scripts', 'gutenberg_enqueue_global_styles' );
	remove_action( 'wp_footer', 'gutenberg_enqueue_global_styles', 1 );

	add_action( 'wp_enqueue_scripts', 'wpcom_enqueue_default_global_styles' );
	add_action( 'wp_footer', 'wpcom_enqueue_default_global_styles', 1 );
}
add_action( 'init', 'wpcom_global_styles_override_for_free_site' );

/**
 * Tracks when global styles are updated or reset after the post has actually been saved.
 *
 * @param int     $blog_id Blog ID.
 * @param WP_Post $post    Post data.
 * @param bool    $updated This value is true if the post existed and was updated.
 */
function wpcom_track_global_styles( $blog_id, $post, $updated ) {
	// If the post isn't updated then we know the gs cpt is being created.
	$event_name = 'wpcom_core_global_styles_create';

	if ( $updated ) {
		// This is a fragile way of checking if the global styles cpt is being reset, we might need to update this condition in the future.
		$global_style_keys      = array_keys( json_decode( $post->post_content, true ) ?? array() );
		$is_empty_global_styles = count( array_diff( $global_style_keys, array( 'version', 'isGlobalStylesUserThemeJSON' ) ) ) === 0;

		// By default, we know that we are at least updating.
		$event_name = 'wpcom_core_global_styles_customize';

		// If we are updating to empty contents then we know for sure we are resetting the contents.
		if ( $is_empty_global_styles ) {
			$event_name = 'wpcom_core_global_styles_reset';
		}
	}

	// Invoke the correct function based on the underlying infrastructure.
	if ( function_exists( 'wpcomsh_record_tracks_event' ) ) {
		wpcomsh_record_tracks_event( $event_name, array() );
	} else {
		require_lib( 'tracks/client' );
		tracks_record_event( get_current_user_id(), $event_name );
	}
}
add_action( 'save_post_wp_global_styles', 'wpcom_track_global_styles', 10, 3 );

/**
 * Checks if the current blog has custom styles in use.
 *
 * @return bool Returns true if custom styles are in use.
 */
function wpcom_global_styles_in_use() {
	$user_cpt = WP_Theme_JSON_Resolver_Gutenberg::get_user_data_from_wp_global_styles( wp_get_theme() );

	if ( ! isset( $user_cpt['post_content'] ) ) {
		return false;
	}

	$global_style_keys = array_keys( json_decode( $user_cpt['post_content'], true ) ?? array() );

	return count( array_diff( $global_style_keys, array( 'version', 'isGlobalStylesUserThemeJSON' ) ) ) > 0;
}

/**
 * Adds the global style notice banner to the custom launch bar controls.
 *
 * @param array $custom_controls List of custom controls.
 *
 * return array The collection of launch bar custom controls to render.
 */
function wpcom_display_global_styles_banner( $custom_controls ) {
	// Do not show the banner if the user can use global styles.
	if ( ! wpcom_should_limit_global_styles() || ! wpcom_global_styles_in_use() ) {
		return;
	}

	if ( method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' ) ) {
		$site_slug = WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() );
	} else {
		$home_url  = home_url( '/' );
		$site_slug = wp_parse_url( $home_url, PHP_URL_HOST );
	}

	$upgrade_url = 'https://wordpress.com/plans/' . $site_slug;

	$custom_controls[] = array(
		'desktop_message'    => __( 'Styles hidden', 'full-site-editing' ),
		'mobile_message'     => __( 'Styles', 'full-site-editing' ),
		'track_button_name'  => 'wpcom_gs_notice',
		'tooltip'            => __( 'You need to be on a paid plan for your style changes to be made public.', 'full-site-editing' ),
		'tooltip_link_title' => __( 'Upgrade your plan', 'full-site-editing' ),
		'tooltip_link_url'   => $upgrade_url,
		'icon_path'          => 'M13 9h-2V7h2v2zm0 2h-2v6h2v-6zm-1-7c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8m0-2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z',
		'icon_color'         => 'orange',
	);

	return $custom_controls;
}
add_filter( 'wpcom_custom_launch_bar_controls', 'wpcom_display_global_styles_banner' );

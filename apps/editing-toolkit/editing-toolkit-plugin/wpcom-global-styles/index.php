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
 * Removes the user styles from a site with limited global styles.
 *
 * @param WP_Theme_JSON_Data|WP_Theme_JSON_Data_Gutenberg $theme_json Class to access and update the underlying data.
 * @return WP_Theme_JSON_Data|WP_Theme_JSON_Data_Gutenberg Filtered data.
 */
function wpcom_block_global_styles_frontend( $theme_json ) {
	if ( ! wpcom_should_limit_global_styles() || wpcom_is_previewing_global_styles() ) {
		return $theme_json;
	}

	if ( class_exists( 'WP_Theme_JSON_Data' ) ) {
		return new WP_Theme_JSON_Data( array(), 'custom' );
	} elseif ( class_exists( 'WP_Theme_JSON_Data_Gutenberg' ) ) {
		return new WP_Theme_JSON_Data_Gutenberg( array(), 'custom' );
	}

	/*
	 * If both `WP_Theme_JSON_Data` and `WP_Theme_JSON_Data_Gutenberg` are missing,
	 * then the site is running an old version of WordPress and Gutenberg where we
	 * cannot block the user styles properly.
	 */
	return $theme_json;
}
add_filter( 'theme_json_user', 'wpcom_block_global_styles_frontend' );
add_filter( 'wp_theme_json_data_user', 'wpcom_block_global_styles_frontend' );

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

	// These properties are for debugging purposes and should be eventually edited or removed.
	$event_props = array(
		'should_limit' => (bool) wpcom_should_limit_global_styles(),
		'is_simple'    => (bool) ! function_exists( 'wpcomsh_record_tracks_event' ),
		'theme'        => get_stylesheet(),
	);

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
		wpcomsh_record_tracks_event( $event_name, $event_props );
	} else {
		require_lib( 'tracks/client' );
		tracks_record_event( get_current_user_id(), $event_name, $event_props );
	}

	// Delegate logging to the underlying infrastructure.
	do_action( 'global_styles_log', $event_name );
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
		do_action( 'global_styles_log', 'global_styles_not_in_use' );
		return false;
	}

	$global_style_keys = array_keys( json_decode( $user_cpt['post_content'], true ) ?? array() );

	$global_styles_in_use = count( array_diff( $global_style_keys, array( 'version', 'isGlobalStylesUserThemeJSON' ) ) ) > 0;

	if ( $global_styles_in_use ) {
		do_action( 'global_styles_log', 'global_styles_in_use' );
	} else {
		do_action( 'global_styles_log', 'global_styles_not_in_use' );
	}

	return $global_styles_in_use;
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
		'track_button_name'  => 'wpcom_global_styles_gating_notice',
		'tooltip'            => __( 'You need to be on a paid plan for your style changes to be made public.', 'full-site-editing' ),
		'tooltip_link_title' => __( 'Upgrade your plan', 'full-site-editing' ),
		'tooltip_link_url'   => $upgrade_url,
		'icon_path'          => 'M13 9h-2V7h2v2zm0 2h-2v6h2v-6zm-1-7c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8m0-2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z',
		'icon_color'         => 'orange',
		'extra_tooltip'      => 'toggle_global_styles',
	);

	return $custom_controls;
}
add_filter( 'wpcom_custom_launch_bar_controls', 'wpcom_display_global_styles_banner' );

/**
 * Include the Rest API that returns the global style information for a give WordPress site.
 */
require_once __DIR__ . '/api/class-global-styles-status-rest-api.php';

/**
 * Checks if the necessary conditions are met in order to establish that the supplied user should be considered as previewing Global Styles.
 *
 * @param int|null $user_id User id to check.
 *
 * @return bool
 */
function wpcom_is_previewing_global_styles( ?int $user_id = null ) {
	if ( null === $user_id ) {
		$user_id = get_current_user_id();
	}

	if ( 0 === $user_id ) {
		return false;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	return isset( $_GET['preview-global-styles'] ) && user_can( $user_id, 'administrator' );
}

/**
 * Renders the link for previewing global styles in the launch banner.
 *
 * @return void
 */
function wpcom_display_global_styles_banner_extra_tooltip() {
	if ( wpcom_is_previewing_global_styles() ) {
		$text     = __( 'Hide premium styles', 'full-site-editing' );
		$location = remove_query_arg( 'preview-global-styles' );
	} else {
		$text     = __( 'Preview styles before upgrading', 'full-site-editing' );
		$location = add_query_arg( 'preview-global-styles', '' );
	}

	?>
	<a class="launch-custom-link" href="<?php echo esc_url( $location ); ?>"><?php echo esc_html( $text ); ?></a>
	<?php
}
add_action( 'launch_bar_extra_tooltip_toggle_global_styles', 'wpcom_display_global_styles_banner_extra_tooltip' );

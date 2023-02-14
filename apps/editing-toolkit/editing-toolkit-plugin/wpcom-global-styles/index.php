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
	/**
	 * Filter to force a limited Global Styles scenario. Useful for unit testing.
	 *
	 * @param bool $force_limit_global_styles Whether Global Styles are forced to be limited.
	 */
	$force_limit_global_styles = apply_filters( 'wpcom_force_limit_global_styles', false );
	if ( $force_limit_global_styles ) {
		return true;
	}

	if ( ! $blog_id ) {
		if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
			$blog_id = get_current_blog_id();
		} elseif ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			$blog_id = method_exists( 'Jetpack_Options', 'get_option' )
				? (int) Jetpack_Options::get_option( 'id' )
				: get_current_blog_id();
		} else {
			return false;
		}
	}

	// Do not limit Global Styles on sites created before we made it a paid feature (2022-12-15).
	if ( $blog_id < 213403000 ) {
		return false;
	}

	if ( wpcom_site_has_feature( WPCOM_Features::GLOBAL_STYLES, $blog_id ) ) {
		return false;
	}

	if ( function_exists( 'has_blog_sticker' ) && has_blog_sticker( 'theme-demo-site', $blog_id ) ) {
		return false;
	}

	if ( function_exists( 'wpcomsh_is_site_sticker_active' ) && wpcomsh_is_site_sticker_active( 'theme-demo-site' ) ) {
		return false;
	}

	return true;
}

/**
 * Enqueues the WP.com Global Styles scripts and styles for the block editor.
 *
 * @return void
 */
function wpcom_global_styles_enqueue_block_editor_assets() {
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
			'upgradeUrl' => "$calypso_domain/plans/$site_slug?plan=value_bundle&feature=advanced-design-customization",
		)
	);
	wp_enqueue_style(
		'wpcom-global-styles-editor',
		plugins_url( 'dist/wpcom-global-styles.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'wpcom_global_styles_enqueue_block_editor_assets' );

/**
 * Enqueues the WP.com Global Styles scripts and styles for the front end.
 *
 * @return void
 */
function wpcom_global_styles_enqueue_assets() {
	if ( ! wpcom_should_limit_global_styles() ) {
		return;
	}

	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles-view.asset.php';
	$asset        = file_exists( $asset_file )
		? require $asset_file
		: null;
	$dependencies = $asset['dependencies'] ?? array();
	$version      = $asset['version'] ?? filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles-view.min.js' );

	wp_enqueue_script(
		'wpcom-global-styles',
		plugins_url( 'dist/wpcom-global-styles-view.min.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);
	wp_enqueue_style(
		'wpcom-global-styles',
		plugins_url( 'dist/wpcom-global-styles-view.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles-view.css' )
	);
}
add_action( 'wp_enqueue_scripts', 'wpcom_global_styles_enqueue_assets' );

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
	}

	/*
	 * If `WP_Theme_JSON_Data` is missing, then the site is running an old
	 * version of WordPress we cannot block the user styles properly.
	 */
	return $theme_json;
}
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
	} elseif ( function_exists( 'require_lib' ) && function_exists( 'tracks_record_event' ) ) {
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
	/*
	 * If `WP_Theme_JSON_Resolver` is missing, then the site is running an old version
	 * of WordPress, so we cannot determine whether the site has custom styles.
	 */
	if ( ! class_exists( 'WP_Theme_JSON_Resolver' ) ) {
		return false;
	}

	$user_cpt = WP_Theme_JSON_Resolver::get_user_data_from_wp_global_styles( wp_get_theme() );

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
 * Adds the global style notice banner to the launch bar controls.
 *
 * @param array $bar_controls List of launch bar controls.
 *
 * return array The collection of launch bar controls to render.
 */
function wpcom_display_global_styles_launch_bar( $bar_controls ) {
	// Do not show the banner if the user can use global styles.
	if ( ! wpcom_should_limit_global_styles() || ! wpcom_global_styles_in_use() ) {
		return $bar_controls;
	}

	if ( method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' ) ) {
		$site_slug = WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() );
	} else {
		$home_url  = home_url( '/' );
		$site_slug = wp_parse_url( $home_url, PHP_URL_HOST );
	}

	$upgrade_url = 'https://wordpress.com/plans/' . $site_slug . '?plan=value_bundle&feature=advanced-design-customization';

	if ( wpcom_is_previewing_global_styles() ) {
		$preview_text     = __( 'Hide custom styles', 'full-site-editing' );
		$preview_location = remove_query_arg( 'preview-global-styles' );
	} else {
		$preview_text     = __( 'Preview custom styles', 'full-site-editing' );
		$preview_location = add_query_arg( 'preview-global-styles', '' );
	}

	ob_start(); ?>
		<div class="launch-bar-global-styles-button">
			<?php if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) : // Workaround for the shadow DOM used on Atomic sites. ?>
				<style id="wpcom-launch-bar-global-styles-button-style">
					<?php include __DIR__ . '/dist/wpcom-global-styles-view.css'; ?>
					.hidden { display: none; }
				</style>
				<script id="wpcom-launch-bar-global-styles-button-script">
					<?php
					include __DIR__ . '/dist/wpcom-global-styles-view.min.js';
					$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-global-styles-view.asset.php';
					$asset        = file_exists( $asset_file ) ? require $asset_file : null;
					$dependencies = $asset['dependencies'] ?? array();
					foreach ( $dependencies as $dep ) {
						$dep_script = wp_scripts()->registered[ $dep ];
						if ( ! $dep_script ) {
							continue;
						}
						include ABSPATH . $dep_script->src;
					}
					?>
				</script>
			<?php endif; ?>
			<div class="launch-bar-global-styles-popover hidden">
				<div>
					<?php echo esc_html__( 'Your site contains customized styles that will only be visible once you upgrade to a Premium plan.', 'full-site-editing' ); ?>
				</div>
				<a
					class="launch-bar-global-styles-upgrade-button"
					href="<?php echo esc_url( $upgrade_url ); ?>"
				>
					<?php echo esc_html__( 'Upgrade your plan', 'full-site-editing' ); ?>
				</a>
				<a class="launch-bar-global-styles-preview-link" href="<?php echo esc_url( $preview_location ); ?>">
					<?php echo esc_html( $preview_text ); ?>
				</a>
			</div>
			<a class="launch-bar-global-styles-toggle" href="#">
				<svg width="25" height="25" viewBox="0 0 30 23" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 4c-4.4 0-8 3.6-8 8v.1c0 4.1 3.2 7.5 7.2 7.9h.8c4.4 0 8-3.6 8-8s-3.6-8-8-8zm0 15V5c3.9 0 7 3.1 7 7s-3.1 7-7 7z" style="fill: orange" />
				</svg>
				<span class="is-mobile">
					<?php echo esc_html__( 'Styles', 'full-site-editing' ); ?>
				</span>
				<span class="is-desktop">
					<?php echo esc_html__( 'Custom styles', 'full-site-editing' ); ?>
				</span>
			</a>
		</div>
	<?php
	$global_styles_bar_control = ob_get_clean();

	$launch_site_control_key = array_search( 'launch-site', array_keys( $bar_controls ), true );

	if ( $launch_site_control_key ) {
		array_splice( $bar_controls, $launch_site_control_key, 0, $global_styles_bar_control );
	} else {
		$bar_controls[] = $global_styles_bar_control;
	}
	return $bar_controls;
}
add_filter( 'wpcom_launch_bar_controls', 'wpcom_display_global_styles_launch_bar' );

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

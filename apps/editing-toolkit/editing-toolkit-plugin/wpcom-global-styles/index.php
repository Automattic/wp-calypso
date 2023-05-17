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
			/*
			 * Atomic sites have the WP.com blog ID stored as a Jetpack option. This code deliberately
			 * doesn't use `Jetpack_Options::get_option` so it works even when Jetpack has not been loaded.
			 */
			$jetpack_options = get_option( 'jetpack_options' );
			if ( is_array( $jetpack_options ) && isset( $jetpack_options['id'] ) ) {
				$blog_id = (int) $jetpack_options['id'];
			} else {
				$blog_id = get_current_blog_id();
			}
		} else {
			return false;
		}
	}

	// Do not limit Global Styles on theme demo sites.
	if ( wpcom_global_styles_has_blog_sticker( 'theme-demo-site', $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles if the site paid for it.
	if ( wpcom_site_has_feature( WPCOM_Features::GLOBAL_STYLES, $blog_id ) ) {
		return false;
	}

	// Do not limit Global Styles on sites created before we made it a paid feature (2022-12-15),
	// that had already used Global Styles.
	if ( wpcom_premium_global_styles_is_site_exempt( $blog_id ) ) {
		return false;
	}

	return true;
}

/**
 * Get the WPCOM blog id of the current site for tracking purposes.
 */
function wpcom_global_styles_get_wpcom_current_blog_id() {
	if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
		return get_current_blog_id();
	} elseif ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
		/*
		 * Atomic sites have the WP.com blog ID stored as a Jetpack option. This code deliberately
		 * doesn't use `Jetpack_Options::get_option` so it works even when Jetpack has not been loaded.
		 */
		$jetpack_options = get_option( 'jetpack_options' );
		if ( is_array( $jetpack_options ) && isset( $jetpack_options['id'] ) ) {
			return (int) $jetpack_options['id'];
		}
	}

	return null;
}

/**
 * Wrapper to test a blog sticker on both Simple and Atomic sites at once.
 *
 * @param string $blog_sticker The blog sticker.
 * @param int    $blog_id The WPCOM blog ID.
 * @return bool Whether the site has the blog sticker.
 */
function wpcom_global_styles_has_blog_sticker( $blog_sticker, $blog_id ) {
	if ( function_exists( 'has_blog_sticker' ) && has_blog_sticker( $blog_sticker, $blog_id ) ) {
		return true;
	}
	if ( function_exists( 'wpcomsh_is_site_sticker_active' ) && wpcomsh_is_site_sticker_active( $blog_sticker ) ) {
		return true;
	}
	return false;
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
			'assetsUrl'   => plugins_url( 'dist/', __FILE__ ),
			'upgradeUrl'  => "$calypso_domain/plans/$site_slug?plan=value_bundle&feature=style-customization",
			'wpcomBlogId' => wpcom_global_styles_get_wpcom_current_blog_id(),
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
	if (
		! wpcom_global_styles_current_user_can_edit_wp_global_styles() ||
		! wpcom_should_limit_global_styles() ||
		! wpcom_global_styles_in_use()
	) {
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
 * Check if a `wp_global_styles` post contains custom Global Styles.
 *
 * @param array $wp_global_styles_post The `wp_global_styles` post.
 * @return bool Whether the post contains custom Global Styles.
 */
function wpcom_global_styles_in_use_by_wp_global_styles_post( array $wp_global_styles_post = array() ) {
	if ( ! isset( $wp_global_styles_post['post_content'] ) ) {
		return false;
	}

	$global_style_keys    = array_keys( json_decode( $wp_global_styles_post['post_content'], true ) ?? array() );
	$global_styles_in_use = count( array_diff( $global_style_keys, array( 'version', 'isGlobalStylesUserThemeJSON' ) ) ) > 0;
	return $global_styles_in_use;
}

/**
 * Checks if the current user can edit the `wp_global_styles` post type.
 *
 * @param int $blog_id Blog ID.
 * @return bool Whether the current user can edit the `wp_global_styles` post type.
 */
function wpcom_global_styles_current_user_can_edit_wp_global_styles( $blog_id = 0 ) {
	// Non-Simple sites on a lower plan are temporary edge cases.
	// We skip this check to prevent fatals on non-multisite installations.
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return true;
	}

	if ( ! $blog_id ) {
		$blog_id = get_current_blog_id();
	}
	switch_to_blog( $blog_id );
	$wp_global_styles_cpt = get_post_type_object( 'wp_global_styles' );
	restore_current_blog();
	return current_user_can( $wp_global_styles_cpt->cap->publish_posts );
}

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

	$global_styles_in_use = wpcom_global_styles_in_use_by_wp_global_styles_post( $user_cpt );

	if ( $global_styles_in_use ) {
		do_action( 'global_styles_log', 'global_styles_in_use' );
	} else {
		do_action( 'global_styles_log', 'global_styles_not_in_use' );
	}

	return $global_styles_in_use;
}

/**
 * Checks whether the site is exempt from Premium Global Styles because
 * it was created before the Premium Global Styles launch date (2022-12-15)
 * and had already customized its Global Styles.
 *
 * We use blog stickers and other strategies to only perform the intensive check
 * when strictly needed.
 *
 * @param  int $blog_id Blog ID.
 * @return bool Whether the site is exempt from Premium Global Styles.
 */
function wpcom_premium_global_styles_is_site_exempt( $blog_id = 0 ) {
	// Sites created after we made GS a paid feature (2022-12-15) are never exempt.
	if ( $blog_id >= 213403000 ) {
		return false;
	}

	// If the exemption check has already been performed, just return if the site is exempt.
	if ( wpcom_global_styles_has_blog_sticker( 'wpcom-premium-global-styles-exemption-checked', $blog_id ) ) {
		return wpcom_global_styles_has_blog_sticker( 'wpcom-premium-global-styles-exempt', $blog_id );
	}

	// Non-Simple sites on a lower plan are temporary edge cases.
	// We exempt them to prevent unexpected temporary changes in their styles.
	if ( ! defined( 'IS_WPCOM' ) || ! IS_WPCOM ) {
		return true;
	}

	// If the current user cannot modify the `wp_global_styles` CPT, the exemption check is not needed;
	// other conditions will determine whether they can use GS.
	if ( ! wpcom_global_styles_current_user_can_edit_wp_global_styles( $blog_id ) ) {
		return false;
	}

	switch_to_blog( $blog_id );

	$note = 'See https://wp.me/p7DVsv-fY6#comment-44778';

	add_blog_sticker( 'wpcom-premium-global-styles-exemption-checked', $note, null, $blog_id );

	$global_styles_used = false;

	$wp_global_styles_posts = get_posts(
		array(
			'post_type'   => 'wp_global_styles',
			'numberposts' => 100,
		)
	);
	foreach ( $wp_global_styles_posts as $wp_global_styles_post ) {
		if ( wpcom_global_styles_in_use_by_wp_global_styles_post( $wp_global_styles_post->to_array() ) ) {
			$global_styles_used = true;
			break;
		}
	}

	if ( $global_styles_used ) {
		add_blog_sticker( 'wpcom-premium-global-styles-exempt', $note, null, $blog_id );
	}

	restore_current_blog();

	return $global_styles_used;
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

	$upgrade_url = 'https://wordpress.com/plans/' . $site_slug . '?plan=value_bundle&feature=style-customization';

	if ( wpcom_is_previewing_global_styles() ) {
		$preview_location = remove_query_arg( 'preview-global-styles' );
	} else {
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
				<div class="launch-bar-global-styles-close">
					<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
				</div>
				<div class="launch-bar-global-styles-message">
					<?php
					$message = sprintf(
						/* translators: %s - documentation URL. */
						__( 'Your site includes <a href="%s" target="_blank">customized styles</a> that are only visible to visitors after upgrading to the Premium plan or higher.', 'full-site-editing' ),
						'https://wordpress.com/support/using-styles/'
					);
					echo sprintf(
						wp_kses(
							$message,
							array(
								'a' => array(
									'href'   => array(),
									'target' => array(),
								),
							)
						)
					);
					?>
				</div>
				<a
					class="launch-bar-global-styles-upgrade"
					href="<?php echo esc_url( $upgrade_url ); ?>"
				>
					<?php echo esc_html__( 'Upgrade now', 'full-site-editing' ); ?>
				</a>
				<a class="launch-bar-global-styles-preview" href="<?php echo esc_url( $preview_location ); ?>">
					<label><input type="checkbox" <?php echo wpcom_is_previewing_global_styles() ? 'checked' : ''; ?>><span></span></label>
					<?php echo esc_html__( 'Preview custom styles', 'full-site-editing' ); ?>
				</a>
			</div>
			<a class="launch-bar-global-styles-toggle" href="#">
				<svg width="25" height="25" viewBox="0 96 960 960" xmlns="http://www.w3.org/2000/svg">
					<path d="M479.982 776q14.018 0 23.518-9.482 9.5-9.483 9.5-23.5 0-14.018-9.482-23.518-9.483-9.5-23.5-9.5-14.018 0-23.518 9.482-9.5 9.483-9.5 23.5 0 14.018 9.482 23.518 9.483 9.5 23.5 9.5ZM453 623h60V370h-60v253Zm27.266 353q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80 658.319 80 575.5q0-82.819 31.5-155.659Q143 347 197.5 293t127.341-85.5Q397.681 176 480.5 176q82.819 0 155.659 31.5Q709 239 763 293t85.5 127Q880 493 880 575.734q0 82.734-31.5 155.5T763 858.316q-54 54.316-127 86Q563 976 480.266 976Zm.234-60Q622 916 721 816.5t99-241Q820 434 721.188 335 622.375 236 480 236q-141 0-240.5 98.812Q140 433.625 140 576q0 141 99.5 240.5t241 99.5Zm-.5-340Z" style="fill: orange"/>
				</svg>
				<span class="is-mobile">
					<?php echo esc_html__( 'Upgrade', 'full-site-editing' ); ?>
				</span>
				<span class="is-desktop">
					<?php echo esc_html__( 'Upgrade required', 'full-site-editing' ); ?>
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

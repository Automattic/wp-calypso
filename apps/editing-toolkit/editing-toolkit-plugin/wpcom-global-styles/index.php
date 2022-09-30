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
		$calypso_domain = $_GET['origin']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
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

	$tree = new WP_Theme_JSON_Gutenberg();

	// Merge theme and core data.
	$tree->merge( WP_Theme_JSON_Resolver_Gutenberg::get_theme_data() );
	$tree->merge( WP_Theme_JSON_Resolver_Gutenberg::get_core_data() );

	// Generate the default spacing sizes presets.
	$tree->set_spacing_sizes();

	// We only get the stylesheet for variables and styles of the theme.
	$stylesheet = $tree->get_stylesheet( array( 'variables', 'styles' ), array( 'theme' ) );

	if ( $can_use_cached ) {
		// This cache can be long since it only applies to customers that can't load global styles.
		// Once the customer is on a paid plan this code isn't executed and will use the default
		// Gutenberg global styles loading mechanism instead.
		set_transient( $transient_name, $stylesheet, MINUTE_IN_SECONDS );
	}

	return $stylesheet;
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

	// If the site does not meet the required criteria we override Global Styles with the free version of global styles.
	if ( wpcom_should_limit_global_styles( $blog_id ) ) {
		global $wp_styles;
		$wp_styles->add_data( 'global-styles', 'after', array( wpcom_get_free_global_stylesheet() ) );
	}
}
add_action( 'wp_print_styles', 'wpcom_global_styles_override_for_free_site' );

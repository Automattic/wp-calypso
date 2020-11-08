<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE\Coming_soon
 */

namespace A8C\FSE\Coming_soon;

/**
 * Determines whether the coming soon page should be shown.
 *
 * @return boolean
 */
function show_coming_soon_page() {
	global $post;

	// Handle the case where we are not rendering a post.
	if ( ! isset( $post ) ) {
		return false;
	}

	$should_show = ( (int) get_option( 'wpcom_public_coming_soon' ) === 1 );

	if ( is_user_logged_in() && current_user_can( 'read' ) ) {
		$should_show = false;
	}

	return apply_filters( 'a8c_show_coming_soon_page', $should_show );
}

/**
 * Renders a fallback coming soon page
 */
function render_fallback_coming_soon_page() {
	remove_action( 'wp_enqueue_scripts', 'wpcom_actionbar_enqueue_scripts', 101 );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_head', 'header_js', 5 );
	remove_action( 'wp_head', 'global_css', 5 );
	remove_action( 'wp_footer', 'wpcom_subs_js' );
	remove_action( 'wp_footer', 'stats_footer', 101 );
	wp_enqueue_style( 'recoleta-font', '//s1.wp.com/i/fonts/recoleta/css/400.min.css', array(), PLUGIN_VERSION );

	include __DIR__ . '/fallback-coming-soon-page.php';
}

/**
 * This filter makes sure it's possible to fetch `wpcom_public_coming_soon` option via public-api.wordpress.com.
 *
 * @param object $options array Retrieved site options, ready to be returned as API respomnse.
 *
 * @return array current value of `wpcom_public_coming_soon`
 */
function add_public_coming_soon_to_settings_endpoint_get( $options ) {
	$options['wpcom_public_coming_soon'] = (int) get_option( 'wpcom_public_coming_soon' );

	return $options;
}
add_filter( 'site_settings_endpoint_get', __NAMESPACE__ . '\add_public_coming_soon_to_settings_endpoint_get' );

/**
 * This filter makes sure it's possible to change `wpcom_public_coming_soon` option via public-api.wordpress.com.
 *
 * @param object $input Filtered POST input.
 * @param object $unfiltered_input Raw and unfiltered POST input.
 *
 * @return mixed
 */
function add_public_coming_soon_to_settings_endpoint_post( $input, $unfiltered_input ) {
	if ( array_key_exists( 'wpcom_public_coming_soon', $unfiltered_input ) ) {
		$input['wpcom_public_coming_soon'] = (int) $unfiltered_input['wpcom_public_coming_soon'];
	}
	return $input;
}
add_filter( 'rest_api_update_site_settings', __NAMESPACE__ . '\add_public_coming_soon_to_settings_endpoint_post', 10, 2 );

/**
 * Launch the site when the privacy mode changes from public-not-indexed
 * This can happen due to clicking the launch button from the banner
 * Or due to manually updating the setting in wp-admin or calypso settings page.
 *
 * @param string $old_value the old value of blog_public.
 * @param string $value     the new value of blog_public.
 */
function disable_coming_soon_on_privacy_change( $old_value, $value ) {
	if ( 0 !== (int) $old_value || 0 === (int) $value ) {
		// Do nothing if not moving from public-not-indexed.
		return;
	}
	update_option( 'wpcom_public_coming_soon', 0 );
}
add_action( 'update_option_blog_public', __NAMESPACE__ . '\disable_coming_soon_on_privacy_change', 10, 2 );

// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
/**
 * Adds the `wpcom_public_coming_soon` option to new sites
 *
 * @param int    $blog_id    Blog ID.
 * @param int    $user_id    User ID.
 * @param string $domain     Site domain.
 * @param string $path       Site path.
 * @param int    $site_id    Site ID.
 * @param array  $meta       Meta data. Used to set initial site options.
 */
function add_option_to_new_site( $blog_id, $user_id, $domain, $path, $site_id, $meta ) {
	if ( 0 === $meta['public'] && 1 === (int) $meta['options']['wpcom_public_coming_soon'] ) {
		add_blog_option( $blog_id, 'wpcom_public_coming_soon', 1 );
	} else {
		add_blog_option( $blog_id, 'wpcom_public_coming_soon', 0 );
	}
}
// phpcs:enable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
add_action( 'wpmu_new_blog', __NAMESPACE__ . '\add_option_to_new_site', 10, 6 );

/**
 * Decides whether to redirect to the site's coming soon page and performs
 * the redirect.
 */
function coming_soon_page() {
	if ( ! show_coming_soon_page() ) {
		return;
	}

	add_filter( 'wpcom_disable_logged_out_follow', '__return_true', 10, 1 ); // Disable follow actionbar.
	add_filter( 'wpl_is_enabled_sitewide', '__return_false', 10, 1 ); // Disable likes.

	render_fallback_coming_soon_page();
	die();
}
add_action( 'template_redirect', __NAMESPACE__ . '\coming_soon_page' );

/**
 * We offer Public Coming Soon mode for both simple and Atomic sites. This function is notified whenever atomic site setting.
 * update is being requested via Calypso. It updates the value of `wpcom_public_coming_soon` site option.
 *
 * @see sync_blog_public_and_atomic_privacy_model_for_atomic_sites
 *
 * @param  object|WP_Error         $response              Response from Jetpack API.
 * @param  array                   $json_api_request_args Jetpack API request args.
 * @param  WPCOM_JSON_API_Endpoint $endpoint              Local endpoint instance. It's not really used on WP.com - $response comes from corresponding code called on remote site.
 * @param  int                     $site_id               ID of the site in question.
 * @return object|WP_Error         the potentially-mutated API response body or WP_Error on failure.
 */
function store_wpcom_public_coming_soon_on_atomic_settings_update( $response, $json_api_request_args, $endpoint, $site_id ) : object {
	if (
		is_wp_error( $response ) ||
		! is_a( $endpoint, 'WPCOM_JSON_API_Site_Settings_Endpoint' ) ||
		! \A8C\Atomic\is_wpcom_atomic( $site_id )
	) {
		return $response;
	}

	if ( 'POST' === $json_api_request_args['method'] ) {
		// Check if response is in expected format
		if ( ! isset( $response->updated ) ) {
			return $response;
		}

		// Act based on the value of blog_public requested by user.
		$request_body = json_decode( $json_api_request_args['body'] );

		if ( ! isset( $request_body->wpcom_public_coming_soon ) ) {
			return $response;
		}

		// Don't update if the new value is the same as the old one.
		$old_value = get_blog_option( $site_id, 'wpcom_public_coming_soon' );
		$new_value = $request_body->wpcom_public_coming_soon ? 1 : 0;
		if ( $old_value === $new_value ) {
			return $response;
		}

		update_blog_option( $site_id, 'wpcom_public_coming_soon', $new_value );

		// Deep clone to avoid mutating the original response.
		$response                                    = json_decode( wp_json_encode( $response ) );
		$response->updated                           = (object) $response->updated; // json_decode reads an empty object as an array
		$response->updated->wpcom_public_coming_soon = $new_value;

		return $response;
	}

	if ( 'GET' === $json_api_request_args['method'] ) {
		// Check if response is in expected format.
		if ( ! $response->settings ) {
			return $response;
		}

		// Deep clone to avoid mutating the original response
		$response = json_decode( json_encode( $response ) );
		$response->settings->wpcom_public_coming_soon = (int) get_blog_option( $site_id, 'wpcom_public_coming_soon' );
	}

	return $response;
}
add_filter( 'wpcom_json_api_jetpack_response', 'store_wpcom_public_coming_soon_on_atomic_settings_update', 10, 4 );


/**
 * Updates the site settings response in the Jetpack API to return the value of `wpcom_public_coming_soon`
 *
 * Calypso settings are managed using Site_Settings_Endpoint. The /site/<id> endpoint is proxied to remote Jetpack site.
 * The problem is that for Atomic sites all requests to Site_Settings_Endpoint are passed directly to Jetpack API on remote host and no Endpoint code is executed
 * on WP.com.
 *
 * This function is notified:
 * After wpcom-json-api.php receives a response from Atomic site.
 * Before that response is returned to the client.
 **
 * @param  object|WP_Error         $response              Response from Jetpack API.
 * @param  array                   $json_api_request_args Jetpack API request args.
 * @param  WPCOM_JSON_API_Endpoint $endpoint              Local endpoint instance. It's not really used on WP.com - $response comes from corresponding code called on remote site.                       
 * @param  int                     $site_id               ID of the site in question,
 * @return object|WP_Error         the potentially-mutated API response body or WP_Error on failure.
 */
function add_wpcom_public_coming_soon_to_atomic_settings_response( $response, $json_api_request_args, $endpoint, $site_id ) : object {
	if (
		is_wp_error( $response ) ||
		! is_a( $endpoint, 'WPCOM_JSON_API_GET_Site_Endpoint' ) ||
		! \A8C\Atomic\is_wpcom_atomic( $site_id )
	) {
		return $response;
	}

	if ( 'GET' === $json_api_request_args['method'] ) {
		// Deep clone to avoid mutating the original response
		$response                 = json_decode( wp_json_encode( $response ) );
		$response->is_coming_soon = (bool) get_blog_option( $site_id, 'wpcom_public_coming_soon' );
	}

	return $response;
}
add_filter( 'wpcom_json_api_jetpack_response', 'add_wpcom_public_coming_soon_to_atomic_settings_response', 10, 4 );


<?php
/**
 * Error reporting from wp-admin / Gutenberg context for simple sites and Atomic.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\ErrorReporting;

/**
 * Whether or not the site is eligible for Error Reporting, which is a feature that's
 * specific to WPCOM.
 *
 * By default, sites should not be eligible.
 *
 * @return bool True if current site is eligible for error reporting, false otherwise.
 */
function is_site_eligible_for_error_reporting() {
	/**
	 * Can be used to toggle the Error Reporting functionality.
	 *
	 * @param bool true if Error Reporting should be enabled, false otherwise.
	 */
	return apply_filters( 'a8c_enable_error_reporting', false );
}

/**
 * Inline  error handler that will capture errors before
 * the main handler has a chance to. Errors are pushed
 * to a global array called `_jsErr` which is then verified
 * in the main handler. See `./index.js`.
 */
function head_error_handler() {
	?><script type="text/javascript">
		window._headJsErrorHandler = function( errEvent ) {
			window._jsErr = window._jsErr || [];
			window._jsErr.push( errEvent );
		}
		window.addEventListener( 'error', window._headJsErrorHandler );
	</script>
	<?php
}

/**
 * Limit the attribute to script els that point to scripts served from s0.wp.com.
 * We might want to add stats.wp.com and widgets.wp.com here, too. See: https://wp.me/pMz3w-cCq#comment-86959.
 * "Staticized" (aka minified or concatenaded) scripts don't go through this pipeline, so they are not processed
 * by this filter. The attribute is added to those directly in jsconcat, see D57238-code.
 *
 * @param {string} $tag string containing the def of a script tag.
 */
function add_crossorigin_to_script_els( $tag ) {
	$end_of_tag = strpos( $tag, '>' );
	if ( false === $end_of_tag ) {
		return $tag;
	}

	// Get JUST the <script ...> tag, not anything else. $tag can include the content of the script as well.
	// Assumes that $tag begins with <script..., which does seem to be the case in our testing.
	$script_tag = substr( $tag, 0, $end_of_tag + 1 );

	// If the src of that script tag points to an internal domain, set crossorigin=anonymous.
	// phpcs:disable WordPress.WP.EnqueuedResources.NonEnqueuedScript
	if ( preg_match( '/<script.*src=.*(s0\.wp\.com|stats\.wp\.com|widgets\.wp\.com).*>/', $script_tag ) ) {
		// Update the src of the <script...> tag.
		$new_tag = str_replace( ' src=', " crossorigin='anonymous' src=", $script_tag );
		// Then, find the original script_tag within the ENTIRE $tag, and replace
		// it with the updated version. Now the script includes crossorigin=anonymous.
		return str_replace( $script_tag, $new_tag, $tag );
	};

	return $tag;
}

/**
 * Temporary function to feature flag Sentry by segment. We'll be testing
 * it on production (simple sites) for a while to see if it's feasible to
 * activate it for all sites and perhaps get rid of our custom solution.
 * If it works well, we'll activate for all simple sites and look into.
 * activating it for WoA, too.
 *
 * @param int $user_id the user id.
 * @return bool
 */
function user_in_sentry_test_segment( $user_id ) {
	$current_segment = 10; // segment of existing users that will get this feature in %.
	$user_segment    = $user_id % 100;

	// We get the last two digits of the user id and that will be used to decide in what
	// segment the user is. i.e if current_segment is 10, then only ids that end in < 10
	// will be considered part of the segment.
	return $user_segment < $current_segment;
}

/**
 * Return whether Sentry should be activated for a given user.
 *
 * In this phase, a12s have the possibility of configuring what error reporter to use
 * through the sticker. a12s should not be covered by the segment logic.
 *
 * Regular users have the error reporter chosen based on the segmentation logic, only.
 *
 * @param int $user_id The user id. Used to check if the user is A8C or in
 * the Sentry test segment.
 * @param int $blog_id The blog ID. Usually the value of `get_current_blog_id`.
 * Used to check if the sticker is applied if user is A8C.
 */
function should_activate_sentry( $user_id, $blog_id ) {
	return ( is_automattician( $user_id ) && has_blog_sticker( 'error-reporting-use-sentry', $blog_id ) )
		|| ( ! is_automattician( $user_id ) && user_in_sentry_test_segment( $user_id ) );
}

/**
 * Enqueue assets
 */
function enqueue_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/error-reporting.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/error-reporting.min.js' );
	$script_id           = 'a8c-fse-error-reporting-script';

	wp_enqueue_script(
		$script_id,
		plugins_url( 'dist/error-reporting.min.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_localize_script(
		$script_id,
		'A8C_ETK_ErrorReporting_Config',
		array(
			'shouldActivateSentry' => should_activate_sentry( get_current_user_id(), get_current_blog_id() ) ? 'true' : 'false',
			'releaseName'          => defined( 'WPCOM_DEPLOYED_GIT_HASH' ) ? 'WPCOM_' . WPCOM_DEPLOYED_GIT_HASH : 'WPCOM_NO_RELEASE',
		)
	);
}

/**
 * Setup the error reporting module by setting the necessary hooks. Whether or not we get the
 * homebrew version or Sentry is decided inside the `enqueue_script` function, stored in a bool
 * var, and passed over to the clientside script (index.js) which will then use this value to
 * decide what tool to activate.
 */
function setup_error_reporting() {
	add_action( 'admin_print_scripts', __NAMESPACE__ . '\head_error_handler', 0 );
	add_filter( 'script_loader_tag', __NAMESPACE__ . '\add_crossorigin_to_script_els', 99, 2 );
	// We load as last as possible for perf reasons. The head handler will
	// capture errors until the main handler is loaded.
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_script', 99 );
}

if ( is_site_eligible_for_error_reporting() ) {
	setup_error_reporting();
}

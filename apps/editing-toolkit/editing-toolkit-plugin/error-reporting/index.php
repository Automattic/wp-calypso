<?php
/**
 * Error reporting from wp-admin / Gutenberg context for simple sites and Atomic.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\ErrorReporting;

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
	// phpcs:disable WordPress.WP.EnqueuedResources.NonEnqueuedScript
	if ( preg_match( '/<script\s.*src=.*(s0\.wp\.com|stats\.wp\.com|widgets\.wp\.com).*>/', $tag ) ) {
		return str_replace( ' src', ' crossorigin="anonymous" src', $tag );
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
 * Returns whether or not the user is an automattician, but first verifies
 * if the function `is_automattician` exists in the current context. If not,
 * then we consider the user to not be an automattician. This guard is needed
 * because this function is not present in some envs, namely the testing env.
 *
 * @todo Remove once roll-out is complete
 *
 * @param int $user_id the user id.
 * @return bool
 */
function user_is_automattician( $user_id ) {
	return function_exists( __NAMESPACE__ . '\is_automattician' ) && is_automattician( $user_id );
}

/**
 * Returns whether or not the site loading ETK is in the WoA env.
 *
 * @return bool
 */
function is_atomic() {
	return defined( 'IS_ATOMIC' ) && IS_ATOMIC;
}
/**
 * Return whether Sentry should be activated for a given user.
 *
 * In this phase, a12s have the possibility of configuring what error reporter to choose
 * through the sticker. a12s shouldn not be covered by the segment logic.
 *
 * Regular users have the error reporter chosen based on the segmentation logic, only.
 *
 * @param int $user_id The user id. Used to check if the user is A8C or in
 * the Sentry test segment.
 * @param int $blog_id The blog ID. Usually the value of `get_current_blog_id`.
 * Used to check if the sticker is applied if user is A8C.
 */
function should_activate_sentry( $user_id, $blog_id ) {
	return ( user_is_automattician( $user_id ) && has_blog_sticker( 'error-reporting-use-sentry', $blog_id ) )
		|| ( ! user_is_automattician( $user_id ) && user_in_sentry_test_segment( $user_id ) );
}

/**
 * Enqueue assets
 */
function enqueue_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/error-reporting.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/error-reporting.js' );
	$script_id           = 'a8c-fse-error-reporting-script';

	wp_enqueue_script(
		$script_id,
		plugins_url( 'dist/error-reporting.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	wp_localize_script(
		$script_id,
		'dataFromPHP',
		array(
			'shouldActivateSentry' => should_activate_sentry( get_current_user_id(), get_current_blog_id() ) ? 'true' : 'false',
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
	add_action( 'admin_print_scripts', __NAMESPACE__ . '\head_error_handler' );
	add_filter( 'script_loader_tag', __NAMESPACE__ . '\add_crossorigin_to_script_els', 99, 2 );
	// We load as last as possible for perf reasons. The head handler will
	// capture errors until the main handler is loaded.
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_script', 99 );
}

// We don't want to activate this module in AT just yet. See https://wp.me/p4TIVU-9DI#comment-10922.
// @todo Remove once we have a version that works for WPCOM simple sites and WoA.
if ( ! is_atomic() ) {
	setup_error_reporting();
}

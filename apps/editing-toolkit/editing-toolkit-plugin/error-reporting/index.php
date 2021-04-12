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
			console.log(errEvent);
			window._jsErr = window._jsErr || [];
			window._jsErr.push(errEvent);
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
	if ( preg_match( '/<script\s.*src=.*s0\.wp\.com.*>/', $tag ) ) {
		return str_replace( ' src', " crossorigin='anonymous' src", $tag );
	};
	return $tag;
}

/**
 * Enqueue assets
 */
function enqueue_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/error-reporting.asset.php';
	$script_dependencies = isset( $asset_file['dependencies'] ) ? $asset_file['dependencies'] : array();
	$script_version      = isset( $asset_file['version'] ) ? $asset_file['version'] : filemtime( plugin_dir_path( __FILE__ ) . 'dist/error-reporting.js' );

	wp_enqueue_script(
		'a8c-fse-error-reporting-script',
		plugins_url( 'dist/error-reporting.js', __FILE__ ),
		$script_dependencies,
		$script_version,
		true
	);

	// Debug snippet to test a (native) cors exception after the main handler loaded and the head handler has been deleted. Test code, delete later.
	wp_enqueue_script(
		'cors-script-test',
		plugins_url( 'corserror-main.js' ),
		array(),
		'1',
		true
	);
}

/**
 * Effectivelly activates the error reporting module by setting the necessary hooks.
 */
function activate_error_reporting() {
	add_action( 'admin_print_scripts', __NAMESPACE__ . '\head_error_handler' );
	add_filter( 'script_loader_tag', __NAMESPACE__ . '\add_crossorigin_to_script_els', 99, 2 );
	add_action( 'init', __NAMESPACE__ . '\enqueue_script', -1000 );
}

/**
 * Temporary function to feature flag by segment. We'll be gradually testing
 * it on production simple-sites, observing how it works and and gradually
 * increase the segment until we reach 100 and eventually just remove this logic.
 */
function rollout_gradually() {
	$current_segment = 10; // segment of existing users that will get this feature.
	$user_id         = get_current_user_id();
	$user_segment    = $user_id % 100;

	l( "ErrorReporting#gradual_rollout(): user_id = $user_id" );
	l( "ErrorReporting#gradual_rollout(): user_segment = $user_segment" );

	// We get the last two digits of the user id and that will be used to decide in what
	// segment the user is. i.e if current_segment is 10, then only ids that end in < 10
	// will be considered part of the segment.
	if ( $user_segment < $current_segment ) {
		l( 'ErrorReporting#gradual_rollout(): error reporting will be activated!' );
		activate_error_reporting();
	}
}

/**
 * Returns whether or not the site loading ETK is in the WoA env
 * which means it's an AT site.
 */
function is_atomic() {
	return defined( 'IS_ATOMIC' ) && IS_ATOMIC;
}

// We don't want to activate this module in AT just yet. See https://wp.me/p4TIVU-9DI#comment-10922.
if ( ! is_atomic() ) {
	rollout_gradually();
}

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
}

/**
 * Effectivelly activates the error reporting module by setting the necessary hooks.
 */
function activate_error_reporting() {
	add_action( 'admin_print_scripts', __NAMESPACE__ . '\head_error_handler' );
	add_filter( 'script_loader_tag', __NAMESPACE__ . '\add_crossorigin_to_script_els', 99, 2 );
	// We load as last as possible for perf reasons. The head handler will
	// capture errors until the main handler is loaded.
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_script', 99 );
}

/**
 * Returns whether or not the site loading ETK is in the WoA env.
 *
 * @return bool
 */
function is_atomic() {
	return defined( 'IS_ATOMIC' ) && IS_ATOMIC;
}

// We don't want to activate this module in AT just yet. See https://wp.me/p4TIVU-9DI#comment-10922.
// @todo Remove once we have a version that works for WPCOM simple sites and WoA.
if ( ! is_atomic() ) {
	activate_error_reporting();
}

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
	// The window.onerror handler can only catch events caused by the current origin, thus, it must be in the main document, or a script loaded from that origin
	?><script type="text/javascript">
	  window._headJsErrorHandler = function( errEvent ) {
			window._jsErr = window._jsErr || [];
			console.log(errEvent);
			window._jsErr.push(errEvent);
		}
		window.addEventListener('error', window._headJsErrorHandler );

		throw new Error('KABOOOOM');
	</script>
	<script crossorigin="anonymous" src="https://s0.wp.com/wp-content/plugins/corserror-head.js"></script>
	<?php
}
add_action( 'admin_print_scripts', __NAMESPACE__ . '\head_error_handler' );

function add_crossorigin_to_script_els( $tag ) {
	if ( preg_match( '/<script\s.*src=.*s0\.wp\.com.*>/', $tag ) ) {
		return str_replace( ' src', " crossorigin='anonymous' src", $tag );
	};
	return $tag;
}
add_filter( 'script_loader_tag', __NAMESPACE__ . '\add_crossorigin_to_script_els', 99, 2 );

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

	// Test cors error after the main handler loaded and the head handler has been deleted. Test code, delete later.
	wp_enqueue_script(
		'cors-script-test',
		plugins_url( 'corserror-main.js' ),
		array(),
		'1',
		true
	);
}
add_action( 'init', __NAMESPACE__ . '\enqueue_script', -1000 );

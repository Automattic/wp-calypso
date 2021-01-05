<?php
/**
 * File for various functionality which needs to be added to Simple and Atomic
 * sites. The code in this file is always loaded in the block editor.
 *
 * Currently, this module may not be the best place if you need to load
 * front-end assets, but you could always add a separate action for that.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\JsLogErrors;

function enqueue( $hook_suffix ) {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/index.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	$version             = $asset_file['version'] || filemtime( plugin_dir_path( __FILE__ ) . 'dist/index.js' );
	wp_enqueue_script(
		'a8c-fse-js-log-errors',
		plugins_url( 'dist/index.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		$version,
		true
	);

	add_action( "admin_print_scripts-$hook_suffix", __NAMESPACE__ . '\head_error_handler', 1 );
}

function head_error_handler() {
	?><script>
	try {
		window.addEventListener( 'error', function ( message, script, line ) {
			window._fse_errlog = window._fse_errlog || [];
			window._fse_errlog.push([ message, script, line ]);
		}
	} catch (err) {}
	</script>
	<?php
}

function setup() {
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue' );
}
setup();

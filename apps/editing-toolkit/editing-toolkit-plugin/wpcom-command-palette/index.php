<?php

function wpcom_command_palette_enqueue_js() {
	if ( A8C\FSE\Common\is_block_editor_screen() ) {
		l( 'this is the block editor, getting out of here' );
		return;
	}

	$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/wpcom-command-palette.asset.php';
	$asset        = file_exists( $asset_file )
		? require $asset_file
		: null;
	$dependencies = $asset['dependencies'] ?? array();
	$version      = $asset['version'] ?? filemtime( plugin_dir_path( __FILE__ ) . 'dist/wpcom-command-palette.min.js' );

	wp_enqueue_script(
		'wpcom-command-palette',
		plugins_url( 'dist/wpcom-command-palette.min.js', __FILE__ ),
		$dependencies,
		$version,
		true
	);

	l( 'script enqueued' );

}
l( 'adding action wpcom_command_palette_enqueue_js' );

add_action( 'admin_enqueue_scripts', 'wpcom_command_palette_enqueue_js' );

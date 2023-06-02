<?php
/**
 * Timeline Block
 *
 * @package A8C\FSE
 */

// Register Block Scripts.
add_action(
	'init',
	function () {
		$asset_file   = __DIR__ . '/dist/jetpack-timleine.asset.php';
		$asset        = file_exists( $asset_file ) ? require $asset_file : null;
		$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
		$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( __DIR__ . '/index.js' );

		// Block JS.
		wp_register_script(
			'jetpack-timeline',
			plugins_url( 'dist/jetpack-timeline.min.js', __FILE__ ),
			$dependencies,
			$version,
			true
		);

		$style_file = is_rtl()
		? 'jetpack-timeline.rtl.css'
		: 'jetpack-timeline.css';

		wp_register_style(
			'jetpack-timeline',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);

		// Register block.
		register_block_type(
			'jetpack/timeline',
			array(
				'editor_script'   => 'jetpack-timeline',
				'editor_style'    => 'jetpack-timeline',
				'render_callback' => function ( $attribs, $content ) {
					wp_enqueue_style( 'jetpack-timeline' );
					return $content;
				},
			)
		);

		// Allow vars for CSS props.
		add_filter(
			'safe_style_css',
			function ( $attr ) {
				$attr[] = '--timeline-background-color';
				$attr[] = '--timeline-text-color';
				return $attr;
			},
			10,
			2
		);

		wp_set_script_translations( 'jetpack-timeline', 'full-site-editing' );

	}
);


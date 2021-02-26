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
		$asset = \A8C\FSE\use_webpack_assets( basename( __DIR__ ), array( 'register_only' => true ) );

		register_block_type(
			'jetpack/timeline',
			array(
				'editor_script'   => $asset['asset_handle'],
				'editor_style'    => $asset['asset_handle'],
				'render_callback' => function ( $attribs, $content ) use ( $asset ) {
					wp_enqueue_style( $asset['asset_handle'] );
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
	}
);


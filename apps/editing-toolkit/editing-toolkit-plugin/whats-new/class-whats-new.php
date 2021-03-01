<?php
/**
 * WPCOM addition to Gutenberg post editor menu
 *
 * Enqueues JS modifications to add What's New option
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

add_action(
	'enqueue_block_editor_assets',
	function () {
		$asset = use_webpack_assets( basename( __DIR__ ) );

		wp_localize_script(
			$asset['asset_handle'],
			'whatsNewAssetsUrl',
			$asset['asset_dir_url']
		);
	}
);

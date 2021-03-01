<?php
/**
 * WPCOM block patterns modifications.
 *
 * Enqueues JS modifications to how block patterns behave within the editor.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

add_action(
	'enqueue_block_editor_assets',
	function () {
		use_webpack_assets( basename( __DIR__ ) );
	}
);

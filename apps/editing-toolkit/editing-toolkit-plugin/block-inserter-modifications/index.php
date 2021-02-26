<?php
/**
 * Block Inserter Modifications
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

add_action(
	'enqueue_block_editor_assets',
	function () {
		use_webpack_assets( basename( __DIR__ ) );
	},
	0
);

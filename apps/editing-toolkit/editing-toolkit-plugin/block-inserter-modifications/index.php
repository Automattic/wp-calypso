<?php
/**
 * Block Inserter Modifications
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enqueue script for the Block Inserter modifications.
 */
function enqueue_block_inserter_modifications() {
	use_webpack_assets( 'block-inserter-modifications' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_inserter_modifications', 0 );

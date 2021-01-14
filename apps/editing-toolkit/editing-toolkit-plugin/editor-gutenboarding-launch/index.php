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

namespace A8C\FSE;

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}

	use_webpack_assets( 'editor-gutenboarding-launch' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );

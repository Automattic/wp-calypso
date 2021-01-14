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

namespace A8C\FSE\EditorSiteLaunch;

use function A8C\FSE\enqueue_webpack_assets;

/**
 * Enqueue assets
 */
function enqueue_script_and_style() {
	// Avoid loading assets if possible.
	if ( ! \A8C\FSE\Common\is_block_editor_screen() ) {
		return;
	}
	$script_name = enqueue_webpack_assets( 'editor-site-launch' );

	wp_localize_script(
		$script_name,
		'wpcomEditorSiteLaunch',
		array(
			'locale' => determine_locale(),
		)
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_script_and_style' );

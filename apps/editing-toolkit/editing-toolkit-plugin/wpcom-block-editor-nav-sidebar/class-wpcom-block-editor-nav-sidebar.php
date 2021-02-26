<?php
/**
 * WPCOM block editor nav sidebar file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

add_action(
	'enqueue_block_editor_assets',
	function () {
		$asset = use_webpack_assets( basename( __DIR__ ) );

		$post_ids_to_exclude = array();

		// Only exclude page_for_posts when a static page is being used as the front page, because
		// page_for_posts can be a valid id even when showing a traditional blog page on front.
		if ( 'page' === get_option( 'show_on_front' ) ) {
			$post_ids_to_exclude[] = get_option( 'page_for_posts' );
		}

		wp_localize_script(
			$asset['asset_handle'],
			'wpcomBlockEditorNavSidebar',
			array(
				'postIdsToExclude' => $post_ids_to_exclude,
			)
		);

		wp_localize_script(
			$asset['asset_handle'],
			'wpcomBlockEditorNavSidebarAssetsUrl',
			$asset['asset_dir_url']
		);
	}
);

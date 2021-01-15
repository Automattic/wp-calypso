<?php
/**
 * WPCOM block editor nav sidebar file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Block_Editor_Nav_Sidebar
 */
class WPCOM_Block_Editor_Nav_Sidebar {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Block_Editor_Nav_Sidebar
	 */
	private static $instance = null;

	/**
	 * WPCOM_Block_Editor_Nav_Sidebar constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Block_Editor_Nav_Sidebar
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_script_and_style() {
		$asset = use_webpack_assets( 'wpcom-block-editor-nav-sidebar' );

		wp_localize_script(
			$asset['asset_handle'],
			'wpcomBlockEditorNavSidebarAssetsUrl',
			$asset['asset_dir_url']
		);

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
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_Nav_Sidebar', 'init' ) );

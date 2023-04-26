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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-block-editor-nav-sidebar.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-block-editor-nav-sidebar-script',
			plugins_url( 'dist/wpcom-block-editor-nav-sidebar.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_set_script_translations( 'wpcom-block-editor-nav-sidebar-script', 'full-site-editing' );

		wp_localize_script(
			'wpcom-block-editor-nav-sidebar-script',
			'wpcomBlockEditorNavSidebarAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		$post_ids_to_exclude = array();

		// Only exclude page_for_posts when a static page is being used as the front page, because
		// page_for_posts can be a valid id even when showing a traditional blog page on front.
		if ( 'page' === get_option( 'show_on_front' ) ) {
			$post_ids_to_exclude[] = get_option( 'page_for_posts' );
		}

		wp_localize_script(
			'wpcom-block-editor-nav-sidebar-script',
			'wpcomBlockEditorNavSidebar',
			array(
				'postIdsToExclude' => $post_ids_to_exclude,
				'currentSite'      => $this->get_current_site(),
			)
		);

		$style_path = 'dist/wpcom-block-editor-nav-sidebar' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-block-editor-nav-sidebar-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}

	/**
	 * Get current site details.
	 */
	public function get_current_site() {
		return array(
			'launchpad_screen' => get_option( 'launchpad_screen' ),
			'site_intent'      => get_option( 'site_intent' ),
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_Nav_Sidebar', 'init' ) );

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
			plugins_url( 'dist/wpcom-block-editor-nav-sidebar.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'wpcom-block-editor-nav-sidebar-script',
			'wpcomBlockEditorNavSidebarAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		$style_path = 'dist/wpcom-block-editor-nav-sidebar' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-block-editor-nav-sidebar-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_Nav_Sidebar', 'init' ) );

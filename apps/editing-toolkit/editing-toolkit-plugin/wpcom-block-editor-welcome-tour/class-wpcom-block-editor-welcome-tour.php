<?php
/**
 * WPCOM Block Editor Welcome Tour file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Block_Editor_Welcome_Tour
 */
class WPCOM_Block_Editor_Welcome_Tour {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Block_Editor_Welcome_Tour
	 */
	private static $instance = null;

	/**
	 * WPCOM_Block_Editor_Welcome_Tour constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Block_Editor_Welcome_Tour
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-block-editor-welcome-tour.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-block-editor-welcome-tour-script',
			plugins_url( 'dist/wpcom-block-editor-welcome-tour.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'wpcom-block-editor-welcome-tour-script',
			'wpcomBlockEditorWelcomeTourAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		wp_set_script_translations( 'wpcom-block-editor-welcome-tour-script', 'full-site-editing' );

		$style_path = 'dist/wpcom-block-editor-welcome-tour' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-block-editor-welcome-tour-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}

	/**
	 * Register the WPCOM Block Editor NUX endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-welcome-tour-status-controller.php';
		$controller = new WP_REST_WPCOM_Block_Editor_Welcome_Tour_Status_Controller();
		$controller->register_rest_route();
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_Welcome_Tour', 'init' ) );

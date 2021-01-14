<?php
/**
 * WPCOM Block Editor NUX file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Block_Editor_NUX
 */
class WPCOM_Block_Editor_NUX {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Block_Editor_NUX
	 */
	private static $instance = null;

	/**
	 * WPCOM_Block_Editor_NUX constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Block_Editor_NUX
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
		$asset = use_webpack_assets( 'wpcom-block-editor-nux' );

		wp_localize_script(
			$asset['script_name'],
			'wpcomBlockEditorNuxAssetsUrl',
			$asset['asset_dir_url']
		);
	}

	/**
	 * Register the WPCOM Block Editor NUX endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/../wpcom-block-editor-welcome-tour/class-wp-rest-wpcom-block-editor-nux-status-controller.php';
		$controller = new WP_REST_WPCOM_Block_Editor_NUX_Status_Controller();
		$controller->register_rest_route();
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_NUX', 'init' ) );

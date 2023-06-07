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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-block-editor-nux.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-block-editor-nux-script',
			plugins_url( 'dist/wpcom-block-editor-nux.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'wpcom-block-editor-nux-script',
			'wpcomBlockEditorNuxAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);
		wp_localize_script(
			'wpcom-block-editor-nux-script',
			'wpcomBlockEditorNuxLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);

		wp_set_script_translations( 'wpcom-block-editor-nux-script', 'full-site-editing' );

		$style_path = 'dist/wpcom-block-editor-nux' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-block-editor-nux-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}

	/**
	 * Register the WPCOM Block Editor NUX endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-nux-status-controller.php';
		$controller = new WP_REST_WPCOM_Block_Editor_NUX_Status_Controller();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-first-post-published-modal-controller.php';
		$first_post_published_modal_controller = new WP_REST_WPCOM_Block_Editor_First_Post_Published_Modal_Controller();
		$first_post_published_modal_controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-seller-celebration-modal-controller.php';
		$seller_celebration_modal_controller = new WP_REST_WPCOM_Block_Editor_Seller_Celebration_Modal_Controller();
		$seller_celebration_modal_controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-video-celebration-modal-controller.php';
		$video_celebration_modal_controller = new WP_REST_WPCOM_Block_Editor_Video_Celebration_Modal_Controller();
		$video_celebration_modal_controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-wpcom-block-editor-sharing-modal-controller.php';
		$sharing_modal_controller = new WP_REST_WPCOM_Block_Editor_Sharing_Modal_Controller();
		$sharing_modal_controller->register_rest_route();
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Editor_NUX', 'init' ) );

<?php
/**
 * WPCOM addition to Gutenberg post editor menu
 *
 * Enqueues JS modifications to add What's New option
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Whats_New
 */
class Whats_New {
	/**
	 * Class instance.
	 *
	 * @var Whats_New
	 */
	private static $instance = null;

	/**
	 * WPCOM_Whats_New constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Whats_New
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/whats-new.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'whats-new-script',
			plugins_url( 'dist/whats-new.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'whats-new-script',
			'whatsNewAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		wp_set_script_translations( 'whats-new-script', 'full-site-editing' );

		$style_path = 'dist/whats-new' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'whats-new-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Whats_New', 'init' ) );

<?php
/**
 * Welcome tour file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Welcome_Tour
 */
class Welcome_Tour {
	/**
	 * Class instance.
	 *
	 * @var Welcome_Tour
	 */
	private static $instance = null;

	/**
	 * Welcome_Tour constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Welcome_Tour
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/welcome-tour.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'welcome-tour-script',
			plugins_url( 'dist/welcome-tour.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		$style_path = 'dist/welcome-tour' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'welcome-tour-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}
}

add_action( 'init', array( __NAMESPACE__ . '\Welcome_Tour', 'init' ) );

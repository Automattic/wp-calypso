<?php
/**
 * Help center
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Help_Center
 */
class Help_Center {
	/**
	 * Class instance.
	 *
	 * @var Help_Center
	 */
	private static $instance = null;

	/**
	 * Help_Center constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Help_Center
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
	public function enqueue_script() {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/help-center.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'help-center-script',
			plugins_url( 'dist/help-center.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_enqueue_style(
			'help-center-style',
			plugins_url( 'dist/help-center' . ( is_rtl() ? '.rtl.css' : '.css' ), __FILE__ ),
			array(),
			$version
		);

		wp_localize_script(
			'help-center-script',
			'helpCenterLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);

		wp_set_script_translations( 'help-center-script', 'full-site-editing' );
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Help_Center', 'init' ) );

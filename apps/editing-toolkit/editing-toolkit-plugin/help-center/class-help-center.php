<?php
/**
 * Help center
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

define( 'HELP_CENTER_BUNDLE_PATH', 'https://widgets.wp.com/help-center/build.min.js' );
define( 'HELP_CENTER_CSS_PATH', 'https://widgets.wp.com/help-center/build.min.css' );
define( 'HELP_CENTER_RTL_CSS_PATH', 'https://widgets.wp.com/help-center/build.min.rtl.css' );

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
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ), 100 );
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
		wp_enqueue_script(
			'help-center-script',
			HELP_CENTER_BUNDLE_PATH,
			array(),
			time(),
			true
		);

		wp_enqueue_style(
			'help-center-style',
			is_rtl() ? HELP_CENTER_RTL_CSS_PATH : HELP_CENTER_CSS_PATH,
			array(),
			time()
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

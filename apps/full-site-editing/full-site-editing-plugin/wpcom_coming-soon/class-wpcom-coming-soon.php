<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Coming_Soon
 */
class WPCOM_Coming_Soon {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Coming_Soon
	 */
	private static $instance = null;

	/**
	 * WPCOM_Coming_Soon constructor.
	 */
	public function __construct() {}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Coming_Soon
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Coming_Soon', 'init' ) );

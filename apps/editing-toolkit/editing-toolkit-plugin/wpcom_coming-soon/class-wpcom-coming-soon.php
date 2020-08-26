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

	// check whether we should show a coming soon page
	// @TODO check whether user has paid upgrade
	function should_show_coming_soon_page() {
		global $post;

		if ( is_user_logged_in() ) {
			return false;
		}

		// Handle the case where we are not rendering a post.
		if ( ! isset( $post ) ) {
			return false;
		}

		// Allow anonymous previews
		if ( isset( $_GET['preview'] ) ) {
			return false;
		}

		return ( (int) get_option( 'wpcom_coming_soon' ) === 1 );
	}
}

add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Coming_Soon', 'init' ) );

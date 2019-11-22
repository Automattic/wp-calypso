<?php
/**
 * A8C Newspack file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Newspack_Blocks
 */
class Newspack_Blocks {

	/**
	 * Class instance.
	 *
	 * @var Newspack_Blocks
	 */
	private static $instance = null;

	/**
	 * Newspack_Blocks constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'register_scripts' ] );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Newspack_Blocks
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register block editor scripts.
	 */
	public function register_scripts() {
		wp_enqueue_script(
			'a8c-newspack-blocks',
			plugins_url( 'dist/a8c-newspack-blocks.js', __FILE__ ),
			[ 'wp-plugins', 'wp-edit-post', 'wp-element' ],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/a8c-newspack-blocks.js' ),
			true
		);
	}
}

<?php
/**
 * A8C Newspack file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

const BUILD_JS_FILE = 'dist/homepage-posts-block.js';

/**
 * Class Homepage_Posts
 */
class Homepage_Posts {

	/**
	 * Class instance.
	 *
	 * @var Homepage_Posts
	 */
	private static $instance = null;

	/**
	 * Homepage_Posts constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'register_scripts' ] );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Homepage_Posts
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
			'homepage-posts-block',
			plugins_url( BUILD_JS_FILE, __FILE__ ),
			[],
			filemtime( plugin_dir_path( __FILE__ ) . BUILD_JS_FILE ),
			true
		);
	}
}

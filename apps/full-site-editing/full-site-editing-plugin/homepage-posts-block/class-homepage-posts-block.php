<?php
/**
 * A8C Newspack file.
 *
 * @package A8C\FSE\Homepage_Posts
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
	 * Return the most appropriate thumbnail size to display.
	 *
	 * @param string $orientation The block's orientation settings: landscape|portrait|square.
	 *
	 * @return string Returns the thumbnail key to use.
	 */
	public static function image_size_for_orientation( $orientation = 'landscape' ) {
		$sizes = array(
			'landscape' => array(
				'large'  => array(
					1200,
					900,
				),
				'medium' => array(
					800,
					600,
				),
				'small'  => array(
					400,
					300,
				),
				'tiny'   => array(
					200,
					150,
				),
			),
			'portrait'  => array(
				'large'  => array(
					900,
					1200,
				),
				'medium' => array(
					600,
					800,
				),
				'small'  => array(
					300,
					400,
				),
				'tiny'   => array(
					150,
					200,
				),
			),
			'square'    => array(
				'large'  => array(
					1200,
					1200,
				),
				'medium' => array(
					800,
					800,
				),
				'small'  => array(
					400,
					400,
				),
				'tiny'   => array(
					200,
					200,
				),
			),
		);

		foreach ( $sizes[ $orientation ] as $key => $dimensions ) {
			$attachment = wp_get_attachment_image_src(
				get_post_thumbnail_id( get_the_ID() ),
				'newspack-article-block-' . $orientation . '-' . $key
			);
			if ( $dimensions[0] === $attachment[1] && $dimensions[1] === $attachment[2] ) {
				return 'newspack-article-block-' . $orientation . '-' . $key;
			}
		}
	}

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
			[ 'wp-plugins', 'wp-edit-post', 'wp-element' ],
			filemtime( plugin_dir_path( __FILE__ ) . BUILD_JS_FILE ),
			true
		);
	}
}

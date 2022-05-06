<?php
/**
 * WPCOM addition to Gutenberg post tags section
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Tags_Education
 */
class Tags_Education {
	/**
	 * Class instance.
	 *
	 * @var Tags_Education
	 */
	private static $instance = null;

	/**
	 * Tags_Education constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Tags_Education
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/tags-education.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'tags-education-script',
			plugins_url( 'dist/tags-education.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		// TODO: remove tagsEducationLocale after fixing useLocalizeUrl.
		// See https://github.com/Automattic/wp-calypso/pull/55527.
		wp_localize_script(
			'tags-education-script',
			'tagsEducationLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);

		wp_set_script_translations( 'tags-education-script', 'full-site-editing' );
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Tags_Education', 'init' ) );

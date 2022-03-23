<?php
/**
 * WPCOM change documentation links
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Documentation
 */
class WPCOM_Documentation_Links {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Documentation_Links
	 */
	private static $instance = null;

	/**
	 * WPCOM_Documentation_Links constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Documentation_Links
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-documentation-links.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-documentation-links-script',
			plugins_url( 'dist/wpcom-documentation-links.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'wpcom-documentation-links-script',
			'wpcomDocumentationLinksAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);
		wp_localize_script(
			'wpcom-documentation-links-script',
			'wpcomDocumentationLinksLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);

		wp_set_script_translations( 'wpcom-documentation-links-script', 'full-site-editing' );
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Documentation_Links', 'init' ) );

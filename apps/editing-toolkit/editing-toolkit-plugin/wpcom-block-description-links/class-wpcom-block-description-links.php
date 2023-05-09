<?php
/**
 * WPCOM add support link to block descriptions.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Block_Description_Links
 */
class WPCOM_Block_Description_Links {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Block_Description_Links
	 */
	private static $instance = null;

	/**
	 * WPCOM_Block_Description_Links constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Block_Description_Links
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-block-description-links.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-block-description-links-script',
			plugins_url( 'dist/wpcom-block-description-links.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script(
			'wpcom-block-description-links-script',
			'wpcomBlockDescriptionLinksAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		wp_localize_script(
			'wpcom-block-description-links-script',
			'wpcomBlockDescriptionLinksLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);
	}

}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Block_Description_Links', 'init' ) );

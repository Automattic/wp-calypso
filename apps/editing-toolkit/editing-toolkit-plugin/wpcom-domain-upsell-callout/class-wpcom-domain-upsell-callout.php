<?php
/**
 * WPCOM Domain upsell callout file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Domain_Upsell_Callout
 */
class WPCOM_Domain_Upsell_Callout {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Block_Editor_Nav_Sidebar
	 */
	private static $instance = null;

	/**
	 * WPCOM_Domain_Upsell_Callout constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Domain_Upsell_Callout
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
	public function enqueue_script_and_style() {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-domain-upsell-callout.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-domain-upsell-callout-script',
			plugins_url( 'dist/wpcom-domain-upsell-callout.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_set_script_translations( 'wpcom-domain-upsell-callout-script', 'full-site-editing' );

		wp_localize_script(
			'wpcom-domain-upsell-callout-script',
			'wpcomDomainUpsellCalloutAssetsUrl',
			plugins_url( 'dist/', __FILE__ )
		);

		$style_path = 'dist/wpcom-domain-upsell-callout' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-domain-upsell-callout-style',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}

	/**
	 * Get current site details.
	 */
	public function get_current_site() {
		return array(
			'launchpad_screen' => get_option( 'launchpad_screen' ),
			'site_intent'      => get_option( 'site_intent' ),
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Domain_Upsell_Callout', 'init' ) );

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
	 * Check if should show the callout and enqueue the script and style.
	 */
	public function enqueue_script_and_style() {
		// Don't show the callout if the user has a custom domain, is unverified, or is on a P2.
		if ( $this->should_not_show_callout() ) {
			return;
		}

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
	 * Check if the callout should be shown.
	 *
	 * @return boolean
	 */
	private function should_not_show_callout() {
		$blog_id = defined( 'IS_WPCOM' ) && IS_WPCOM ? get_current_blog_id() : \Jetpack_Options::get_option( 'id' );

		return $this->blog_has_custom_domain( $blog_id ) || $this->user_has_email_unverified() || $this->blog_is_p2( $blog_id );
	}

	/**
	 * Get the domain from the site url.
	 *
	 * @return string
	 */
	private function get_domain_from_site_url() {
		$site_url   = get_site_url();
		$parsed_url = wp_parse_url( $site_url );
		return $parsed_url['host'];
	}

	/**
	 * Check if the domain is a WordPress.com-owned TLD.
	 *
	 * @param string $domain // The domain to check.
	 * @return boolean
	 */
	private function is_wpcom_owned_tld( $domain ) {
		// Adopted from https://opengrok.a8c.com/source/xref/wpcom/wp-content/lib/domains/wpcom-domain.php?r=e9e7bb7b#832-862.
		$wpcom_tlds = array(
			'wordpress.de',
			'wordpress.lv',
			'wordpress.com',
			'wpcomstaging.com',
		);

		$domain_parts = explode( '.', $domain );
		$tld          = implode( '.', array_slice( $domain_parts, -2, 2 ) );

		return in_array( $tld, $wpcom_tlds, true );
	}

	/**
	 * Check if the blog has a custom domain.
	 *
	 * @param int $blog_id // The blog id.
	 * @return boolean
	 */
	private function blog_has_custom_domain( $blog_id ) {
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			$domain = $this->get_domain_from_site_url();
			if ( ! $this->is_wpcom_owned_tld( $domain ) ) {
				return true;
			}

			return false;
		}

		$domain_mappings = \Domain_Mapping::find_by_blog_id( $blog_id ) ?? array();

		foreach ( $domain_mappings as $domain_mapping ) {
			if ( ! $domain_mapping->get_domain()->is_wpcom_tld() ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check if the blog is a P2.
	 *
	 * @param int $blog_id // The blog id.
	 * @return boolean
	 */
	private function blog_is_p2( $blog_id ) {
		return defined( 'IS_ATOMIC' ) && IS_ATOMIC ? false : \WPForTeams\is_wpforteams_site( $blog_id );
	}

	/**
	 * Check if the user has an unverified email.
	 *
	 * @return boolean
	 */
	private function user_has_email_unverified() {
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			$is_email_unverified = false;
		} else {
			$user_id             = get_current_user_id();
			$is_email_unverified = \Email_Verification::is_email_unverified( $user_id );
		}
		return $is_email_unverified;
	}

}

add_action( 'init', array( __NAMESPACE__ . '\WPCOM_Domain_Upsell_Callout', 'init' ) );

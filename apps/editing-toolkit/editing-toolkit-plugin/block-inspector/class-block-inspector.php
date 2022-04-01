<?php
/**
 * WPCOM addition to Gutenberg block inspector
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Inspector
 */
class Block_Inspector {
	/**
	 * Class instance.
	 *
	 * @var Block_Inspector
	 */
	private static $instance = null;

	/**
	 * Block_Inspector constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Block_Inspector
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
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/block-inspector.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'block-inspector-script',
			plugins_url( 'dist/block-inspector.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_localize_script( 'block-inspector-script', 'blockInspectorSiteVerticalsTerms', $this->get_site_verticals_terms() );

		wp_set_script_translations( 'block-inspector-script', 'full-site-editing' );

		// Enqueue styles.
		$style_file = is_rtl() ? 'block-inspector.rtl.css' : 'block-inspector.css';

		wp_enqueue_style(
			'block-inspector-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	/**
	 * Get vertical terms from the site verticals API
	 *
	 * @return array Containing vertical terms or nothing if an error occurred.
	 */
	public function get_site_verticals_terms() {
		$request_url = 'https://public-api.wordpress.com/wpcom/v2/site-verticals/terms';
		$response    = wp_remote_get( $request_url );

		if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		return json_decode( wp_remote_retrieve_body( $response ), true );
	}
}

/**
 * Return whether block inspector should be activated for a given user and site.
 *
 * @param int $user_id The user id.
 * @param int $blog_id The blog ID.
 */
function is_site_eligible_for_block_inspector( $user_id, $blog_id ) {
	return is_automattician( $user_id ) && ( has_blog_sticker( 'block-patterns-source-site', $blog_id ) || has_blog_sticker( 'theme-demo-site', $blog_id ) );
}

if ( is_site_eligible_for_block_inspector( get_current_user_id(), get_current_blog_id() ) ) {
	add_action( 'init', array( __NAMESPACE__ . '\Block_Inspector', 'init' ) );
}

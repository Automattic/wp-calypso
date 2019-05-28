<?php
/**
 * Starter page templates file.
 *
 * @package full-site-editing
 */

/**
 * Class Starter_Page_Templates
 */
class Starter_Page_Templates {

	/**
	 * Class instance.
	 *
	 * @var Starter_Page_Templates
	 */
	private static $instance = null;

	/**
	 * Starter_Page_Templates constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_scripts' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Creates instance.
	 *
	 * @return \Starter_Page_Templates
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
		wp_register_script(
			'starter-page-templates',
			plugins_url( 'dist/starter-page-templates.js', __FILE__ ),
			array( 'wp-plugins', 'wp-edit-post', 'wp-element' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/starter-page-templates.js' ),
			true
		);
	}

	/**
	 * Enqueue block editor scripts.
	 */
	public function enqueue_scripts() {
		$screen = get_current_screen();

		// Return early if we don't meet conditions to show templates.
		if ( 'page' !== $screen->id || 'add' !== $screen->action ) {
			return;
		}
		
		// Load templates for this site
		$vertical_name = null;
		$vertical_templates = array();
		
		$vertical_id = get_site_option( 'site_vertical', 'default' );
		$request_url = 'https://public-api.wordpress.com/wpcom/v2/verticals/' . $vertical_id . '/templates';
		$response = wp_remote_get( esc_url_raw( $request_url ) );
		if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
			$api_response = json_decode( wp_remote_retrieve_body( $response ), true );
			$vertical_name = $api_response['vertical'];
			$vertical_templates = $api_response['templates'];
		}
		
		// Bail early if we have no templates to offer
		if ( count($vertical_templates) === 0 ) {
			return;
		}

		wp_enqueue_script( 'starter-page-templates' );

		$default_info = array(
			'title' => get_bloginfo( 'name' ),
			'vertical' => $vertical_name,
		);
		$default_templates = array(
			array(
				'title'   => 'Blank',
				'slug'    => 'blank',
			),
			
		);
		$site_info    = get_site_option( 'site_contact_info', array() );
		$config       = array(
			'siteInformation' => array_merge( $default_info, $site_info ),
			'templates'       => array_merge( $default_templates, $vertical_templates ),
		);
		wp_localize_script( 'starter-page-templates', 'starterPageTemplatesConfig', $config );
	}

	/**
	 * Enqueue styles.
	 */
	public function enqueue_styles() {
		$style_file = is_rtl()
			? 'starter-page-templates.rtl.css'
			: 'starter-page-templates.css';

		wp_enqueue_style(
			'starter-page-templates',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}
}

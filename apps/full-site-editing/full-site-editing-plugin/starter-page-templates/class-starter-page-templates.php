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

		wp_enqueue_script( 'starter-page-templates' );

		$default_info = array(
			'title' => get_bloginfo( 'name' ),
		);
		$site_info    = get_site_option( 'site_contact_info', array() );
		$config       = array(
			'siteInformation' => array_merge( $default_info, $site_info ),
			'templates'       => array(
				array(
					'title'   => '',
					'slug'    => 'blank',
					'label'   => 'Blank',
					'content' => '',
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-blank.png',
				),
				array(
					'title'   => 'Home',
					'slug'    => 'home',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce680d73300009801731614' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-home.jpg',
				),
				array(
					'title'   => 'Menu',
					'slug'    => 'menu',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681173300006600731617' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-menu.jpg',
				),
				array(
					'title'   => 'Contact Us',
					'slug'    => 'contact',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681763300004b3573161a' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-contactus.jpg',
				),
				array(
					'title'   => 'Home 2',
					'slug'    => 'home-2',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce680d73300009801731614' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-home-2.png',
				),
				array(
					'title'   => 'Menu 2',
					'slug'    => 'menu-2',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681173300006600731617' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-menu-2.png',
				),
				array(
					'title'   => 'Contact Us 2',
					'slug'    => 'contact-2',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681763300004b3573161a' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-contactus-2.png',
				),
				array(
					'title'   => 'Menu 3',
					'slug'    => 'menu-3',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681173300006600731617' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-menu.jpg',
				),
				array(
					'title'   => 'Contact Us 3',
					'slug'    => 'contact-3',
					'content' => json_decode( wp_remote_get( 'http://www.mocky.io/v2/5ce681763300004b3573161a' )['body'] )->body->content,
					'preview' => 'https://starterpagetemplatesprototype.files.wordpress.com/2019/05/starter-contactus.jpg',
				),
			),
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

<?php
/**
 * Plugin Name: Full Site Editing
 */

require_once( 'blocks/post-content/index.php' );
require_once( 'blocks/template/index.php' );

class A8C_Full_Site_Editing {
	static $initialized = false;
	private $post_types_using_templates = array( 'page', 'post' );

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_wp_template' ) );
		add_action( 'init', array( $this, 'register_meta_template_id' ) );
		add_action( 'rest_api_init', array( $this, 'allow_searching_for_templates' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	function register_wp_template() {
		require_once plugin_dir_path( __FILE__ ) . 'wp-template.php';
		fse_register_wp_template();
	}

	function register_meta_template_id() {
		foreach( $this->post_types_using_templates as $post_type ) {
			register_meta( $post_type, 'wp_template_id', array(
				'show_in_rest' => true,
				'single' => true,
				'type' => 'integer',
			) );
		}
	}

	function enqueue_script_and_style() {
		$script_dependencies = json_decode( file_get_contents(
			plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.deps.json'
		), true );
		wp_enqueue_script(
			'a8c-full-site-editing-script',
			plugins_url( 'dist/full-site-editing-plugin.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.js' ),
			true
		);

		wp_localize_script( 'a8c-full-site-editing-script', 'fullSiteEditing', array(
			'editorPostType' => get_current_screen()->post_type
		) );

		$style_file = is_rtl()
			? 'full-site-editing-plugin.rtl.css'
			: 'full-site-editing-plugin.css';
		wp_enqueue_style(
			'a8c-full-site-editing-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);

	}

	function register_blocks() {
		register_block_type( 'a8c/post-content', array(
			'render_callback' => 'render_post_content_block',
		 ) );

		register_block_type( 'a8c/template', array(
			'render_callback' => 'render_template_block',
		) );
	}

	/**
	 * This will set the `wp_template` post type to `public` to support
	 * the core search endpoint, which looks for it.
	 *
	 * @return void
	 */
	function allow_searching_for_templates() {
		$post_type = get_post_type_object( 'wp_template' );
		if ( ! ( $post_type instanceof WP_Post_Type ) ) {
			return;
		}
		// setting this to `public` will allow it to be found in the search endpoint
		$post_type->public = true;
	}
}

new A8C_Full_Site_Editing();

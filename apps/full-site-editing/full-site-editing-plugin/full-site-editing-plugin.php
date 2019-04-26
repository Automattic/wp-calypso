<?php
/**
 * Plugin Name: Full Site Editing
 */

require_once( 'blocks/content-slot/index.php' );
require_once( 'blocks/template-part/index.php' );

class A8C_Full_Site_Editing {
	static $initialized = false;

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_script_and_style' ), 100 );
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_wp_template' ) );
	}

	function register_wp_template() {
		require_once plugin_dir_path( __FILE__ ) . 'wp-template.php';
		fse_register_wp_template();
	}

	function register_script_and_style() {
		$script_dependencies = json_decode( file_get_contents(
			plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.deps.json'
		), true );
		wp_register_script(
			'a8c-full-site-editing-script',
			plugins_url( 'dist/full-site-editing-plugin.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.js' )
		);

		$style_file = is_rtl()
			? 'full-site-editing-plugin.rtl.css'
			: 'full-site-editing-plugin.css';
		wp_register_style(
			'a8c-full-site-editing-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	// We only need to declare script and style as dependencies once
	// Because they'll be then enqueued for every block.
	function register_blocks() {
		register_block_type( 'a8c/content-slot', array(
			'editor_script'   => 'a8c-full-site-editing-script',
			'editor_style'    => 'a8c-full-site-editing-style',
			'render_callback' => 'render_content_slot_block',
		 ) );

		register_block_type( 'a8c/template-part', array(
			'render_callback' => 'render_template_part_block',
		) );
	}
}

new A8C_Full_Site_Editing();

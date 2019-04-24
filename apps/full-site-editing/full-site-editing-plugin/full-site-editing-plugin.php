<?php
/**
 * Plugin Name: Full Site Editing
 */

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

	function register_blocks() {
		// This block is only a preview block, it doesn't render anything.
		register_block_type( 'a8c/page-content', [
			'editor_script' => 'a8c-full-site-editing-script',
			'editor_style' => 'a8c-full-site-editing-style',
		] );
	}
}

new A8C_Full_Site_Editing();

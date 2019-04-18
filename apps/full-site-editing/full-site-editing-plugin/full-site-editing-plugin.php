<?php
/**
 * Plugin Name: Full Site Editing
 */

class WPCOM_Full_Site_Editing {
	static $initialized = false;

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		$this->register_script_and_style();

		add_action( 'init', array( $this, 'register_blocks' ), 100 );
	}

	function register_script_and_style() {
		$script_dependencies = json_decode( file_get_contents(
			plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.deps.json'
		), true );
		wp_register_script(
			'wpcom-full-site-editing-script',
			plugins_url( 'dist/full-site-editing-plugin.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.js' )
		);

		$style_file = is_rtl()
			? 'dist/full-site-editing-plugin.rtl.css'
			: 'dist/full-site-editing-plugin.css';
		wp_register_style(
			'wpcom-full-site-editing-style',
			plugins_url( $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_file )
		);
	}

	function register_blocks() {
		// This block is only a preview block, it doesn't render anything.
		register_block_type( 'wpcom/page-content', [
			'editor_script' => 'wpcom-full-site-editing-script',
			'editor_style' => 'wpcom-full-site-editing-style',
		] );
	}
}

new WPCOM_Full_Site_Editing();

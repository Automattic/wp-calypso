<?php
/**
 * Plugin Name: Gutenberg Diff
 */

class A8C_Gutenberg_Diff {
	static $initialized = false;

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_script_and_style' ), 100 );
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
	}

	function register_script_and_style() {
		$script_dependencies = json_decode( file_get_contents(
			plugin_dir_path( __FILE__ ) . 'dist/gutenberg-diff.deps.json'
		), true );
		wp_register_script(
			'a8c-gutenberg-diff-script',
			plugins_url( 'dist/gutenberg-diff.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/gutenberg-diff.js' )
		);

		$style_file = is_rtl()
			? 'gutenberg-diff.rtl.css'
			: 'gutenberg-diff.css';
		wp_register_style(
			'a8c-gutenberg-diff-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	function register_blocks() {
		register_block_type( 'a8c/gutenberg-diff', [
			'editor_script' => 'a8c-gutenberg-diff-script',
			'editor_style' => 'a8c-gutenberg-diff-style',
		] );
	}
}

new A8C_Gutenberg_Diff();

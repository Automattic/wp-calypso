<?php
/**
 * Plugin Name: A8C Post List
 */


class A8C_Post_List {
	static $initialized = false;

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	function enqueue_script_and_style() {
		// TODO: only for pages?
		if ( 'page' !== get_current_screen()->post_type ) {
			return;
		}

		$script_dependencies = json_decode( file_get_contents(
			plugin_dir_path( __FILE__ ) . 'dist/a8c-post-list.deps.json'
		), true );
		wp_enqueue_script(
			'a8c-post-list-script',
			plugins_url( 'dist/a8c-post-list.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/a8c-post-list.js' ),
			true
		);

		$style_file = is_rtl()
			? 'a8c-post-list.rtl.css'
			: 'a8c-post-list.css';
		wp_enqueue_style(
			'a8c-post-list-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	function register_blocks() {
		register_block_type( 'a8c/post-list', array(
			'render_callback' => 'render_a8c_post_list_block',
		 ) );
	}
}

new A8C_Post_List();

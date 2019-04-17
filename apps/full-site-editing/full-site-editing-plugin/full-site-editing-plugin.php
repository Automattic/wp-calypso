<?php
/**
 * Plugin Name: Full Site Editing
 */

class WPCOM_Full_Site_Editing {
	function __construct() {
		$this->register_script_and_style();

		add_action( 'init', [ $this, 'register_blocks' ], 100 );
	}

	function register_script_and_style() {
		wp_register_script(
			'wpcom-full-site-editing-script',
			plugins_url( 'dist/full-site-editing-plugin.js', __FILE__ ),
			[],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.js' )
		);

		wp_register_style(
			'wpcom-full-site-editing-style',
			plugins_url( 'dist/full-site-editing-plugin.css', __FILE__ ),
			[],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.css' )
		);
	}

	function register_blocks() {
		register_block_type( 'wpcom/page-content', [
			'editor_script' => 'wpcom-full-site-editing-script',
			'editor_style' => 'wpcom-full-site-editing-style',
			'render_callback' => [ $this, 'render_page_content_block' ],
		] );
	}

	function render_page_content_block( $attributes ) {
		if ( ! $attributes[ 'pageId' ] ) {
			return '';
		}
		$post = get_post( $attributes[ 'pageId' ] );
		setup_postdata( $post );
		$the_content = get_the_content();
		wp_reset_postdata();
		return $the_content;
	}
}

new WPCOM_Full_Site_Editing();

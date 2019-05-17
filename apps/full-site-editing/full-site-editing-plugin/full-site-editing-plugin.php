<?php
/**
 * Plugin Name: Full Site Editing
 */

require_once( 'blocks/post-content/index.php' );
require_once( 'blocks/template/index.php' );

class A8C_Full_Site_Editing {
	static $initialized = false;

	function __construct() {
		if ( self::$initialized ) {
			return;
		}
		self::$initialized = true;

		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_wp_template' ) );
		add_action( 'rest_api_init', array( $this, 'allow_searching_for_templates' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
		add_filter( 'rest_request_after_callbacks', array( $this, 'filter_posts_to_include_template' ), 10, 3 );
	}

	/**
	 * Filters outbound REST API requests to combine `post_content` in the context of its template
	 *
	 * @param WP_Rest_Response $response REST API response
	 * @return WP_Rest_Response A possibly modified response
	 */
	function filter_posts_to_include_template( $response, $handler, $request ) {
		if ( ! $this->is_a_page_route( $request ) ) {
			return $response;
		}
		return $this->wrap_page_with_template( $response );
	}

	private function is_a_page_route( $request ) {
		$route = $request->get_route();
		return 0 === strpos( $route, '/wp/v2/pages/' )
			&& 0 === preg_match( '#/autosaves$#', $route );
	}

	private function wrap_page_with_template( $response ) {
		$data = $response->get_data();
		$template = $this->get_template_for_post( $data['id'] );
		$post_content = $data['content']['raw'];
		$data['content']['raw'] = $this->merge_content_and_template( $post_content, $template );
		$response->set_data( $data );
		return $response;
	}

	private function merge_content_and_template( $content, $template ) {
		$wrapped = sprintf( '<!-- wp:a8c/post-content -->%s<!-- /wp:a8c/post-content -->', $content );
		$all = str_replace( '<!-- wp:a8c/post-content /-->', $wrapped, $template );
		return $all;
	}

	private function get_template_for_post( $id ) {
		// we'll do this via post meta and such later but let's just hardcode for now
		return '<!-- wp:heading -->
<h2>Pretend This is a Title</h2>
<!-- /wp:heading -->

<!-- wp:a8c/post-content /-->';
	}

	function register_wp_template() {
		require_once plugin_dir_path( __FILE__ ) . 'wp-template.php';
		fse_register_wp_template();
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
			'editorPostType' => get_current_screen()->post_type,
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

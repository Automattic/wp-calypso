<?php
/**
 * Full site editing file.
 *
 * @package full-site-editing
 */

/**
 * Class Full_Site_Editing
 */
class Full_Site_Editing {
	/**
	 * Class instance.
	 *
	 * @var Full_Site_Editing
	 */
	private static $instance = null;

	/**
	 * Full_Site_Editing constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_template_post_types' ) );
		add_action( 'init', array( $this, 'register_meta_template_id' ) );
		add_action( 'rest_api_init', array( $this, 'allow_searching_for_templates' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \Full_Site_Editing
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register post types.
	 */
	public function register_template_post_types() {
		register_post_type(
			'wp_template',
			array(
				'labels'                => array(
					'name'                     => _x( 'Templates', 'post type general name' ),
					'singular_name'            => _x( 'Template', 'post type singular name' ),
					'menu_name'                => _x( 'Templates', 'admin menu' ),
					'name_admin_bar'           => _x( 'Template', 'add new on admin bar' ),
					'add_new'                  => _x( 'Add New', 'Template' ),
					'add_new_item'             => __( 'Add New Template' ),
					'new_item'                 => __( 'New Template' ),
					'edit_item'                => __( 'Edit Template' ),
					'view_item'                => __( 'View Template' ),
					'all_items'                => __( 'All Templates' ),
					'search_items'             => __( 'Search Templates' ),
					'not_found'                => __( 'No templates found.' ),
					'not_found_in_trash'       => __( 'No templates found in Trash.' ),
					'filter_items_list'        => __( 'Filter templates list' ),
					'items_list_navigation'    => __( 'Templates list navigation' ),
					'items_list'               => __( 'Templates list' ),
					'item_published'           => __( 'Template published.' ),
					'item_published_privately' => __( 'Template published privately.' ),
					'item_reverted_to_draft'   => __( 'Template reverted to draft.' ),
					'item_scheduled'           => __( 'Template scheduled.' ),
					'item_updated'             => __( 'Template updated.' ),
				),
				'menu_icon'             => 'dashicons-layout',
				'public'                => false,
				'show_ui'               => true,
				'show_in_menu'          => true,
				'rewrite'               => false,
				'show_in_rest'          => true,
				'rest_base'             => 'templates',
				'rest_controller_class' => 'A8C_REST_Templates_Controller',
				'capability_type'       => 'template',
				'capabilities'          => array(
					// You need to be able to edit posts, in order to read templates in their raw form.
					'read'                   => 'edit_posts',
					// You need to be able to customize, in order to create templates.
					'create_posts'           => 'edit_theme_options',
					'edit_posts'             => 'edit_theme_options',
					'delete_posts'           => 'edit_theme_options',
					'edit_published_posts'   => 'edit_theme_options',
					'delete_published_posts' => 'edit_theme_options',
					'edit_others_posts'      => 'edit_theme_options',
					'delete_others_posts'    => 'edit_theme_options',
					'publish_posts'          => 'edit_theme_options',
				),
				'map_meta_cap'          => true,
				'supports'              => array(
					'title',
					'editor',
				),
			)
		);

		register_post_type(
			'wp_template_part',
			array(
				'labels'                => array(
					'name'                     => _x( 'Template Parts', 'post type general name' ),
					'singular_name'            => _x( 'Template Part', 'post type singular name' ),
					'menu_name'                => _x( 'Template Parts', 'admin menu' ),
					'name_admin_bar'           => _x( 'Template Part', 'add new on admin bar' ),
					'add_new'                  => _x( 'Add New', 'Template Part' ),
					'add_new_item'             => __( 'Add New Template Part' ),
					'new_item'                 => __( 'New Template Part' ),
					'edit_item'                => __( 'Edit Template Part' ),
					'view_item'                => __( 'View Template Part' ),
					'all_items'                => __( 'All Template Parts' ),
					'search_items'             => __( 'Search Template Parts' ),
					'not_found'                => __( 'No template parts found.' ),
					'not_found_in_trash'       => __( 'No template parts found in Trash.' ),
					'filter_items_list'        => __( 'Filter template parts list' ),
					'items_list_navigation'    => __( 'Template parts list navigation' ),
					'items_list'               => __( 'Template parts list' ),
					'item_published'           => __( 'Template part published.' ),
					'item_published_privately' => __( 'Template part published privately.' ),
					'item_reverted_to_draft'   => __( 'Template part reverted to draft.' ),
					'item_scheduled'           => __( 'Template part scheduled.' ),
					'item_updated'             => __( 'Template part updated.' ),
				),
				'menu_icon'             => 'dashicons-layout',
				'public'                => false,
				'show_ui'               => true,
				'show_in_menu'          => true,
				'rewrite'               => false,
				'show_in_rest'          => true,
				'rest_base'             => 'template_parts',
				'rest_controller_class' => 'A8C_REST_Templates_Controller',
				'capability_type'       => 'template_part',
				'capabilities'          => array(
					// You need to be able to edit posts, in order to read templates in their raw form.
					'read'                   => 'edit_posts',
					// You need to be able to customize, in order to create templates.
					'create_posts'           => 'edit_theme_options',
					'edit_posts'             => 'edit_theme_options',
					'delete_posts'           => 'edit_theme_options',
					'edit_published_posts'   => 'edit_theme_options',
					'delete_published_posts' => 'edit_theme_options',
					'edit_others_posts'      => 'edit_theme_options',
					'delete_others_posts'    => 'edit_theme_options',
					'publish_posts'          => 'edit_theme_options',
				),
				'map_meta_cap'          => true,
				'supports'              => array(
					'title',
					'editor',
				),
			)
		);

		register_taxonomy(
			'wp_template_part_type',
			'wp_template_part',
			array(
				'labels'             => array(
					'name'              => _x( 'Template Part Types', 'taxonomy general name' ),
					'singular_name'     => _x( 'Template Part Type', 'taxonomy singular name' ),
					'menu_name'         => _x( 'Template Part Types', 'admin menu' ),
					'all_items'         => __( 'All Template Part Types' ),
					'edit_item'         => __( 'Edit Template Part Type' ),
					'view_item'         => __( 'View Template Part Type' ),
					'update_item'       => __( 'Update Template Part Type' ),
					'add_new_item'      => __( 'Add New Template Part Type' ),
					'new_item_name'     => __( 'New Template Part Type' ),
					'parent_item'       => __( 'Parent Template Part Type' ),
					'parent_item_colon' => __( 'Parent Template Part Type:' ),
					'search_items'      => __( 'Search Template Part Types' ),
					'not_found'         => __( 'No template part types found.' ),
					'back_to_items'     => __( 'Back to template part types' ),
				),
				'public'             => false,
				'publicly_queryable' => true,
				'show_ui'            => true,
				'show_in_menu'       => false,
				'show_in_nav_menu'   => false,
				'show_in_rest'       => true,
				'rest_base'          => 'template_part_types',
				'show_tagcloud'      => false,
				'show_admin_column'  => true,
				'hierarchical'       => true,
				'rewrite'            => false,
				'capabilities'       => array(
					'manage_terms' => 'edit_theme_options',
					'edit_terms'   => 'edit_theme_options',
					'delete_terms' => 'edit_theme_options',
					'assign_terms' => 'edit_theme_options',
				),
			)
		);
	}

	/**
	 * Register post meta.
	 */
	public function register_meta_template_id() {
		register_post_meta(
			'',
			'_wp_template_id',
			array(
				'auth_callback' => array( $this, 'meta_template_id_auth_callback' ),
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'integer',
			)
		);
	}

	/**
	 * Auth callback.
	 *
	 * @return mixed
	 */
	public function meta_template_id_auth_callback() {
		return current_user_can( 'edit_theme_options' );
	}

	/**
	 * Enqueue assets.
	 */
	public function enqueue_script_and_style() {
		$script_dependencies = json_decode(
			file_get_contents(
				plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.deps.json'
			),
			true
		);
		wp_enqueue_script(
			'a8c-full-site-editing-script',
			plugins_url( 'dist/full-site-editing-plugin.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing-plugin.js' ),
			true
		);

		wp_localize_script(
			'a8c-full-site-editing-script',
			'fullSiteEditing',
			array(
				'editorPostType' => get_current_screen()->post_type,
			)
		);

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

	/**
	 * Register blocks.
	 */
	public function register_blocks() {
		register_block_type(
			'a8c/post-content',
			array(
				'render_callback' => 'render_post_content_block',
			)
		);

		register_block_type(
			'a8c/template',
			array(
				'render_callback' => 'render_template_block',
			)
		);
	}

	/**
	 * This will set the `wp_template` and `wp_template_part` post types to `public` to support
	 * the core search endpoint, which looks for it.
	 */
	public function allow_searching_for_templates() {
		$post_type = get_post_type_object( 'wp_template' );
		if ( ! ( $post_type instanceof WP_Post_Type ) ) {
			return;
		}

		// Setting this to `public` will allow it to be found in the search endpoint.
		$post_type->public = true;

		$post_type = get_post_type_object( 'wp_template_part' );
		if ( ! ( $post_type instanceof WP_Post_Type ) ) {
			return;
		}

		// Setting this to `public` will allow it to be found in the search endpoint.
		$post_type->public = true;
	}
}

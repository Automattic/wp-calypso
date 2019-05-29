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
					'name'                     => _x( 'Templates', 'post type general name', 'full-site-editing' ),
					'singular_name'            => _x( 'Template', 'post type singular name', 'full-site-editing' ),
					'menu_name'                => _x( 'Templates', 'admin menu', 'full-site-editing' ),
					'name_admin_bar'           => _x( 'Template', 'add new on admin bar', 'full-site-editing' ),
					'add_new'                  => _x( 'Add New', 'Template', 'full-site-editing' ),
					'add_new_item'             => __( 'Add New Template', 'full-site-editing' ),
					'new_item'                 => __( 'New Template', 'full-site-editing' ),
					'edit_item'                => __( 'Edit Template', 'full-site-editing' ),
					'view_item'                => __( 'View Template', 'full-site-editing' ),
					'all_items'                => __( 'All Templates', 'full-site-editing' ),
					'search_items'             => __( 'Search Templates', 'full-site-editing' ),
					'not_found'                => __( 'No templates found.', 'full-site-editing' ),
					'not_found_in_trash'       => __( 'No templates found in Trash.', 'full-site-editing' ),
					'filter_items_list'        => __( 'Filter templates list', 'full-site-editing' ),
					'items_list_navigation'    => __( 'Templates list navigation', 'full-site-editing' ),
					'items_list'               => __( 'Templates list', 'full-site-editing' ),
					'item_published'           => __( 'Template published.', 'full-site-editing' ),
					'item_published_privately' => __( 'Template published privately.', 'full-site-editing' ),
					'item_reverted_to_draft'   => __( 'Template reverted to draft.', 'full-site-editing' ),
					'item_scheduled'           => __( 'Template scheduled.', 'full-site-editing' ),
					'item_updated'             => __( 'Template updated.', 'full-site-editing' ),
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
					'name'                     => _x( 'Template Parts', 'post type general name', 'full-site-editing' ),
					'singular_name'            => _x( 'Template Part', 'post type singular name', 'full-site-editing' ),
					'menu_name'                => _x( 'Template Parts', 'admin menu', 'full-site-editing' ),
					'name_admin_bar'           => _x( 'Template Part', 'add new on admin bar', 'full-site-editing' ),
					'add_new'                  => _x( 'Add New', 'Template Part', 'full-site-editing' ),
					'add_new_item'             => __( 'Add New Template Part', 'full-site-editing' ),
					'new_item'                 => __( 'New Template Part', 'full-site-editing' ),
					'edit_item'                => __( 'Edit Template Part', 'full-site-editing' ),
					'view_item'                => __( 'View Template Part', 'full-site-editing' ),
					'all_items'                => __( 'All Template Parts', 'full-site-editing' ),
					'search_items'             => __( 'Search Template Parts', 'full-site-editing' ),
					'not_found'                => __( 'No template parts found.', 'full-site-editing' ),
					'not_found_in_trash'       => __( 'No template parts found in Trash.', 'full-site-editing' ),
					'filter_items_list'        => __( 'Filter template parts list', 'full-site-editing' ),
					'items_list_navigation'    => __( 'Template parts list navigation', 'full-site-editing' ),
					'items_list'               => __( 'Template parts list', 'full-site-editing' ),
					'item_published'           => __( 'Template part published.', 'full-site-editing' ),
					'item_published_privately' => __( 'Template part published privately.', 'full-site-editing' ),
					'item_reverted_to_draft'   => __( 'Template part reverted to draft.', 'full-site-editing' ),
					'item_scheduled'           => __( 'Template part scheduled.', 'full-site-editing' ),
					'item_updated'             => __( 'Template part updated.', 'full-site-editing' ),
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
					'name'              => _x( 'Template Part Types', 'taxonomy general name', 'full-site-editing' ),
					'singular_name'     => _x( 'Template Part Type', 'taxonomy singular name', 'full-site-editing' ),
					'menu_name'         => _x( 'Template Part Types', 'admin menu', 'full-site-editing' ),
					'all_items'         => __( 'All Template Part Types', 'full-site-editing' ),
					'edit_item'         => __( 'Edit Template Part Type', 'full-site-editing' ),
					'view_item'         => __( 'View Template Part Type', 'full-site-editing' ),
					'update_item'       => __( 'Update Template Part Type', 'full-site-editing' ),
					'add_new_item'      => __( 'Add New Template Part Type', 'full-site-editing' ),
					'new_item_name'     => __( 'New Template Part Type', 'full-site-editing' ),
					'parent_item'       => __( 'Parent Template Part Type', 'full-site-editing' ),
					'parent_item_colon' => __( 'Parent Template Part Type:', 'full-site-editing' ),
					'search_items'      => __( 'Search Template Part Types', 'full-site-editing' ),
					'not_found'         => __( 'No template part types found.', 'full-site-editing' ),
					'back_to_items'     => __( 'Back to template part types', 'full-site-editing' ),
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
				plugin_dir_path( __FILE__ ) . 'dist/full-site-editing.deps.json'
			),
			true
		);
		wp_enqueue_script(
			'a8c-full-site-editing-script',
			plugins_url( 'dist/full-site-editing.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/full-site-editing.js' ),
			true
		);

		$feature_flags = A8C_Full_Site_Editing_Feature_Flags::get_instance();

		wp_localize_script(
			'a8c-full-site-editing-script',
			'fullSiteEditing',
			array(
				'editorPostType' => get_current_screen()->post_type,
				'featureFlags'  => $feature_flags->get_flags(),
			)
		);

		$style_file = is_rtl()
			? 'full-site-editing.rtl.css'
			: 'full-site-editing.css';
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

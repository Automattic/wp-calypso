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
	 * Custom post types.
	 *
	 * @var Full_Site_Editing
	 */
	private $template_post_types = array( 'wp_template', 'wp_template_part' );

	/**
	 * Full_Site_Editing constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_template_post_types' ) );
		add_action( 'init', array( $this, 'register_meta_template_id' ) );
		add_action( 'rest_api_init', array( $this, 'allow_searching_for_templates' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
		add_filter( 'template_include', array( $this, 'load_page_template' ) );
		add_action( 'the_post', array( $this, 'merge_template_and_post' ) );
		add_filter( 'wp_insert_post_data', array( $this, 'remove_template_components' ), 10, 2 );
		add_filter( 'admin_body_class', array( $this, 'toggle_editor_post_title_visibility' ) );
		add_filter( 'block_editor_settings', array( $this, 'set_block_template' ) );
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
			'wp_template_type',
			'wp_template',
			array(
				'labels'             => array(
					'name'              => _x( 'Template Types', 'taxonomy general name', 'full-site-editing' ),
					'singular_name'     => _x( 'Template Type', 'taxonomy singular name', 'full-site-editing' ),
					'menu_name'         => _x( 'Template Types', 'admin menu', 'full-site-editing' ),
					'all_items'         => __( 'All Template Types', 'full-site-editing' ),
					'edit_item'         => __( 'Edit Template Type', 'full-site-editing' ),
					'view_item'         => __( 'View Template Type', 'full-site-editing' ),
					'update_item'       => __( 'Update Template Type', 'full-site-editing' ),
					'add_new_item'      => __( 'Add New Template Type', 'full-site-editing' ),
					'new_item_name'     => __( 'New Template Type', 'full-site-editing' ),
					'parent_item'       => __( 'Parent Template Type', 'full-site-editing' ),
					'parent_item_colon' => __( 'Parent Template Type:', 'full-site-editing' ),
					'search_items'      => __( 'Search Template Types', 'full-site-editing' ),
					'not_found'         => __( 'No template types found.', 'full-site-editing' ),
					'back_to_items'     => __( 'Back to template types', 'full-site-editing' ),
				),
				'public'             => false,
				'publicly_queryable' => true,
				'show_ui'            => true,
				'show_in_menu'       => false,
				'show_in_nav_menu'   => false,
				'show_in_rest'       => true,
				'rest_base'          => 'template_types',
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
				'editorPostType'          => get_current_screen()->post_type,
				'featureFlags'            => $feature_flags->get_flags(),
				'closeButtonUrl'          => esc_url( $this->get_close_button_url() ),
				'editTemplatePartBaseUrl' => esc_url( $this->get_edit_template_part_base_url() ),
			)
		);

		$style_file = is_rtl()
			? 'full-site-editing.rtl.css'
			: 'full-site-editing.css';
		wp_enqueue_style(
			'a8c-full-site-editing-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			'wp-edit-post',
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	/**
	 * Register blocks.
	 */
	public function register_blocks() {
		register_block_type(
			'a8c/navigation-menu',
			array(
				'attributes'      => [
					'themeLocation' => [
						'default' => 'main-1',
						'type'    => 'string',
					],
				],
				'render_callback' => 'render_navigation_menu_block',
			)
		);

		register_block_type(
			'a8c/post-content',
			array(
				'render_callback' => 'render_post_content_block',
			)
		);

		register_block_type(
			'a8c/site-description',
			array(
				'render_callback' => 'render_site_description_block',
			)
		);

		register_block_type(
			'a8c/template',
			array(
				'render_callback' => 'render_template_block',
			)
		);

		register_block_type(
			'a8c/site-logo',
			array(
				'attributes'      => array(
					'editorPreview' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
				'render_callback' => 'render_site_logo',
			)
		);

		register_block_type(
			'a8c/site-title',
			array(
				'render_callback' => 'render_site_title_block',
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

	/**
	 * Returns the URL for the Gutenberg close button.
	 *
	 * In some cases we want to override the default value which would take us to post listing
	 * for a given post type. For example, when navigating back from Header, we want to show the
	 * parent page editing view, and not the Template Part CPT list.
	 *
	 * @return null|string Override URL string if it should be inserted, or null otherwise.
	 */
	public function get_close_button_url() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['fse_parent_post'] ) ) {
			return null;
		}

		$parent_post_id = absint( $_GET['fse_parent_post'] );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( empty( $parent_post_id ) ) {
			return null;
		}

		$close_button_url = get_edit_post_link( $parent_post_id );

		/**
		 * Filter the Gutenberg's close button URL when editing Template Part CPTs.
		 *
		 * @since 0.1
		 *
		 * @param string Current close button URL.
		 */
		return apply_filters( 'a8c_fse_close_button_link', $close_button_url );
	}

	/**
	 * Returns the base URL for the Edit Template Part button. The URL does not contain neither
	 * the post ID nor the template part ID. Those query arguments should be provided by
	 * the Template Part on the Block.
	 *
	 * @return string edit link without post ID
	 */
	public function get_edit_template_part_base_url() {
		$edit_post_link = remove_query_arg( 'post', get_edit_post_link( 0, 'edit' ) );

		/**
		 * Filter the Gutenberg's edit template part button base URL
		 * when editing pages or posts.
		 *
		 * @since 0.2
		 *
		 * @param string Current edit button URL.
		 */
		return apply_filters( 'a8c_fse_edit_template_part_base_url', $edit_post_link );
	}

	/** This will merge the post content with the post template, modifiying the $post parameter.
	 *
	 * @param WP_Post $post Post instance.
	 */
	public function merge_template_and_post( $post ) {
		// Bail if not a REST API Request.
		if ( defined( 'REST_REQUEST' ) && ! REST_REQUEST ) {
			return;
		}

		// Bail if the post is not a full site page.
		if ( ! $this->is_full_site_page() ) {
			return;
		}

		$template         = new A8C_WP_Template( $post->ID );
		$template_content = $template->get_template_content();

		// Bail if the template has no post content block.
		if ( ! has_block( 'a8c/post-content', $template_content ) ) {
			return;
		}

		$template_blocks = parse_blocks( $template_content );
		$content_attrs   = $this->get_post_content_block_attrs( $template_blocks );

		$wrapped_post_content = sprintf( '<!-- wp:a8c/post-content %s -->%s<!-- /wp:a8c/post-content -->', $content_attrs, $post->post_content );
		$post->post_content   = str_replace( "<!-- wp:a8c/post-content $content_attrs /-->", $wrapped_post_content, $template_content );
	}

	/**
	 * This will extract the attributes from the post content block
	 * json encode them.
	 *
	 * @param array $blocks    An array of template blocks.
	 */
	private function get_post_content_block_attrs( $blocks ) {
		foreach ( $blocks as $key => $value ) {
			if ( 'a8c/post-content' === $value['blockName'] ) {
				return count( $value['attrs'] ) > 0 ? wp_json_encode( $value['attrs'] ) : '';
			}
		}
	}

	/**
	 * This will extract the inner blocks of the post content and
	 * serialize them back to HTML for saving.
	 *
	 * @param array $data    An array of slashed post data.
	 * @param array $postarr An array of sanitized, but otherwise unmodified post data.
	 * @return array
	 */
	public function remove_template_components( $data, $postarr ) {
		// Bail if the post type is one of the template post types.
		if ( in_array( $postarr['post_type'], $this->template_post_types, true ) ) {
			return $data;
		}

		$post_content = wp_unslash( $data['post_content'] );

		// Bail if post content has no blocks.
		if ( ! has_blocks( $post_content ) ) {
			return $data;
		}

		$post_content_blocks = parse_blocks( $post_content );
		$post_content_key    = array_search( 'a8c/post-content', array_column( $post_content_blocks, 'blockName' ), true );

		// Bail if no post content block found.
		if ( ! $post_content_key ) {
			return $data;
		}

		$data['post_content'] = wp_slash( serialize_blocks( $post_content_blocks[ $post_content_key ]['innerBlocks'] ) );
		return $data;
	}

	/**
	 * Determine if the current edited post is a full site page.
	 * If it's a page being loaded that has a `wp_template`, it's a page that our FSE plugin should handle.
	 *
	 * @return boolean
	 */
	public function is_full_site_page() {
		$fse_template = new A8C_WP_Template();

		return 'page' === get_post_type() && $fse_template->get_template_id();
	}

	/**
	 * Determine the page template to use.
	 * If it's a full site page being loaded, use our FSE template.
	 *
	 * @param string $template template URL passed to filter.
	 * @return string Filtered template path.
	 */
	public function load_page_template( $template ) {
		if ( $this->is_full_site_page() ) {
			return plugin_dir_path( __FILE__ ) . 'page-fse.php';
		}

		return $template;
	}

	/**
	 * Return an extra class that will be assigned to the body element if a full site page is being edited.
	 *
	 * That class hides the default post title of the editor and displays a new post title rendered by the post content
	 * block in order to have it just before the content of the post.
	 *
	 * @param string $classes Space-separated list of CSS classes.
	 * @return string
	 */
	public function toggle_editor_post_title_visibility( $classes ) {
		if ( get_current_screen()->is_block_editor() && $this->is_full_site_page() ) {
			$classes .= ' show-post-title-before-content ';
		}
		return $classes;
	}

	/**
	 * Sets the block template to be loaded by the editor when creating a new full site page.
	 *
	 * @param array $editor_settings Default editor settings.
	 * @return array Editor settings with the updated template setting.
	 */
	public function set_block_template( $editor_settings ) {
		if ( $this->is_full_site_page() ) {
			$fse_template    = new A8C_WP_Template();
			$template_blocks = $fse_template->get_template_blocks();

			$template = array();
			foreach ( $template_blocks as $block ) {
				$template[] = fse_map_block_to_editor_template_setting( $block );
			}
			$editor_settings['template'] = $template;
			$editor_settings['templateLock'] = 'all';
		}
		return $editor_settings;
	}
}

/**
 * Returns an array with the expected format of the block template setting syntax.
 *
 * @see https://github.com/WordPress/gutenberg/blob/1414cf0ad1ec3d0f3e86a40815513c15938bb522/docs/designers-developers/developers/block-api/block-templates.md
 *
 * @param array $block Block to convert.
 * @return array
 */
function fse_map_block_to_editor_template_setting( $block ) {
	$block_name   = $block['blockName'];
	$attrs        = $block['attrs'];
	$inner_blocks = $block['innerBlocks'];

	$inner_blocks_template = array();
	foreach ( $inner_blocks as $inner_block ) {
		$inner_blocks[] = fse_map_block_to_editor_template_setting( $inner_block );
	}
	return array( $block_name, $attrs, $inner_blocks_template );
}

if ( ! function_exists( 'serialize_block' ) ) {
	/**
	 * Renders an HTML-serialized form of a block object
	 * from https://core.trac.wordpress.org/ticket/47375
	 *
	 * Should be available since WordPress 5.3.0.
	 *
	 * @param array $block The block being rendered.
	 * @return string The HTML-serialized form of the block
	 */
	function serialize_block( $block ) {
		// Non-block content has no block name.
		if ( null === $block['blockName'] ) {
			return $block['innerHTML'];
		}

		$unwanted = array( '--', '<', '>', '&', '\"' );
		$wanted   = array( '\u002d\u002d', '\u003c', '\u003e', '\u0026', '\u0022' );

		$name      = 0 === strpos( $block['blockName'], 'core/' ) ? substr( $block['blockName'], 5 ) : $block['blockName'];
		$has_attrs = ! empty( $block['attrs'] );
		$attrs     = $has_attrs ? str_replace( $unwanted, $wanted, wp_json_encode( $block['attrs'] ) ) : '';

		// Early abort for void blocks holding no content.
		if ( empty( $block['innerContent'] ) ) {
			return $has_attrs
				? "<!-- wp:{$name} {$attrs} /-->"
				: "<!-- wp:{$name} /-->";
		}

		$output = $has_attrs
			? "<!-- wp:{$name} {$attrs} -->\n"
			: "<!-- wp:{$name} -->\n";

		$inner_block_index = 0;
		foreach ( $block['innerContent'] as $chunk ) {
			$output .= null === $chunk
				? serialize_block( $block['innerBlocks'][ $inner_block_index++ ] )
				: $chunk;

			$output .= "\n";
		}

		$output .= "<!-- /wp:{$name} -->";

		return $output;
	}
}

if ( ! function_exists( 'serialize_blocks' ) ) {
	/**
	 * Renders an HTML-serialized form of a list of block objects
	 * from https://core.trac.wordpress.org/ticket/47375
	 *
	 * Should be available since WordPress 5.3.0.
	 *
	 * @param  array $blocks The list of parsed block objects.
	 * @return string        The HTML-serialized form of the list of blocks.
	 */
	function serialize_blocks( $blocks ) {
		return implode( "\n\n", array_map( 'serialize_block', $blocks ) );
	}
}

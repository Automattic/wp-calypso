<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Full_Site_Editing
 */
class Full_Site_Editing {
	/**
	 * Class instance.
	 *
	 * @var \A8C\FSE\Full_Site_Editing
	 */
	private static $instance = null;

	/**
	 * Custom post types.
	 *
	 * @var array
	 */
	private $template_post_types = [ 'wp_template' ];

	/**
	 * Full_Site_Editing constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 100 );
		add_action( 'init', array( $this, 'register_template_post_types' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
		add_action( 'the_post', array( $this, 'merge_template_and_post' ) );
		add_filter( 'wp_insert_post_data', array( $this, 'remove_template_components' ), 10, 2 );
		add_filter( 'admin_body_class', array( $this, 'toggle_editor_post_title_visibility' ) );
		add_filter( 'block_editor_settings', array( $this, 'set_block_template' ) );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Full_Site_Editing
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
				'rest_controller_class' => __NAMESPACE__ . '\REST_Templates_Controller',
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
					'revisions',
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

		$feature_flags = Feature_Flags::get_instance();

		wp_localize_script(
			'a8c-full-site-editing-script',
			'fullSiteEditing',
			array(
				'editorPostType'      => get_current_screen()->post_type,
				'featureFlags'        => $feature_flags->get_flags(),
				'closeButtonLabel'    => $this->get_close_button_label(),
				'closeButtonUrl'      => esc_url( $this->get_close_button_url() ),
				'editTemplateBaseUrl' => esc_url( $this->get_edit_template_base_url() ),
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
					'className' => [
						'default' => '',
						'type'    => 'string',
					],
				],
				'render_callback' => __NAMESPACE__ . '\render_navigation_menu_block',
			)
		);

		register_block_type(
			'a8c/post-content',
			array(
				'render_callback' => __NAMESPACE__ . '\render_post_content_block',
			)
		);

		register_block_type(
			'a8c/site-description',
			array(
				'render_callback' => __NAMESPACE__ . '\render_site_description_block',
			)
		);

		register_block_type(
			'a8c/template',
			array(
				'render_callback' => __NAMESPACE__ . '\render_template_block',
			)
		);

		register_block_type(
			'a8c/site-title',
			array(
				'render_callback' => __NAMESPACE__ . '\render_site_title_block',
			)
		);
	}

	/**
	 * Returns the parent post ID if sent as query param when editing a Template from a
	 * Post/Page or a Template.
	 *
	 * @return null|string The parent post ID, or null if not set.
	 */
	public function get_parent_post_id() {
		// phpcs:disable WordPress.Security.NonceVerification
		if ( ! isset( $_GET['fse_parent_post'] ) ) {
			return null;
		}

		$parent_post_id = absint( $_GET['fse_parent_post'] );
		// phpcs:enable WordPress.Security.NonceVerification

		if ( empty( $parent_post_id ) ) {
			return null;
		}

		return $parent_post_id;
	}

	/**
	 * Returns the label for the Gutenberg close button.
	 *
	 * When we edit a Template from a Post/Page or a Template, we want to replace the close
	 * icon with a "Back to" button, to clarify that it will take us back to the previous editing
	 * view, and not the Template CPT list.
	 *
	 * @return null|string Override label string if it should be inserted, or null otherwise.
	 */
	public function get_close_button_label() {
		$parent_post_id = $this->get_parent_post_id();

		if ( ! $parent_post_id ) {
			return null;
		}

		$parent_post_type        = get_post_type( $parent_post_id );
		$parent_post_type_object = get_post_type_object( $parent_post_type );

		/* translators: %s: "Back to Post", "Back to Page", "Back to Template", etc. */
		return sprintf( __( 'Back to %s', 'full-site-editing' ), $parent_post_type_object->labels->singular_name );
	}

	/**
	 * Returns the URL for the Gutenberg close button.
	 *
	 * In some cases we want to override the default value which would take us to post listing
	 * for a given post type. For example, when navigating back from Header, we want to show the
	 * parent page editing view, and not the Template CPT list.
	 *
	 * @return null|string Override URL string if it should be inserted, or null otherwise.
	 */
	public function get_close_button_url() {
		$parent_post_id = $this->get_parent_post_id();

		if ( ! $parent_post_id ) {
			return null;
		}

		$close_button_url = get_edit_post_link( $parent_post_id );

		/**
		 * Filter the Gutenberg's close button URL when editing Template CPTs.
		 *
		 * @since 0.1
		 *
		 * @param string Current close button URL.
		 */
		return apply_filters( 'a8c_fse_close_button_link', $close_button_url );
	}

	/**
	 * Returns the base URL for the Edit Template button. The URL does not contain neither
	 * the post ID nor the template ID. Those query arguments should be provided by
	 * the Template on the Block.
	 *
	 * @return string edit link without post ID
	 */
	public function get_edit_template_base_url() {
		$edit_post_link = remove_query_arg( 'post', get_edit_post_link( 0, 'edit' ) );

		/**
		 * Filter the Gutenberg's edit template button base URL
		 * when editing pages or posts.
		 *
		 * @since 0.2
		 *
		 * @param string Current edit button URL.
		 */
		return apply_filters( 'a8c_fse_edit_template_base_url', $edit_post_link );
	}

	/** This will merge the post content with the post template, modifiying the $post parameter.
	 *
	 * @param \WP_Post $post Post instance.
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

		$template         = new WP_Template();
		$template_content = $template->get_page_template_content();

		// Bail if the template has no post content block.
		if ( ! has_block( 'a8c/post-content', $template_content ) ) {
			return;
		}

		$post->post_content = preg_replace( '@(<!-- wp:a8c/post-content)(.*?)(/-->)@', "$1$2-->$post->post_content<!-- /wp:a8c/post-content -->", $template_content );
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
			$fse_template    = new WP_Template();
			$template_blocks = $fse_template->get_template_blocks();

			$template = array();
			foreach ( $template_blocks as $block ) {
				$template[] = fse_map_block_to_editor_template_setting( $block );
			}
			$editor_settings['template']     = $template;
			$editor_settings['templateLock'] = 'all';
		}
		return $editor_settings;
	}

	/**
	 * Determine if the current edited post is a full site page.
	 * So far we only support static pages.
	 *
	 * @return boolean
	 */
	public function is_full_site_page() {
		return 'page' === get_post_type();
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

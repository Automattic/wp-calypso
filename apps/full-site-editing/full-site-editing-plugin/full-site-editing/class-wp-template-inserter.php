<?php
/**
 * Template data inserter class file.
 *
 * In order to avoid duplicating this file in each theme that we want to add FSE support to,
 * let's add it here and make sure it's always included via mu-plugins/full-site-editing.php.
 * This should be the case even when FSE functionality is disabled, to allow themes to populate
 * their data correctly. On Atomic side, we can achieve something similar via wpcomsh.
 *
 * @package A8C\FSE
 */

/**
 * Class WP_Template_Inserter
 */
class WP_Template_Inserter {
	/**
	 * Modern Business header content.
	 *
	 * @var string $header_content
	 */
	private $header_content;

	/**
	 * Modern Business footer content.
	 *
	 * @var string $footer_content
	 */
	private $footer_content;

	/**
	 * Current theme slug.
	 *
	 * @var string $theme_slug
	 */
	private $theme_slug;

	/**
	 * A8C_WP_Template_Parts_Data_Inserter constructor.
	 */
	public function __construct() {
		$this->theme_slug     = get_option( 'stylesheet' );
		$this->header_content = '';
		$this->footer_content = '';
	}

	/**
	 * Retrieves template parts content from WP.com API.
	 */
	public function fetch_template_parts() {
		$request_url = 'https://public-api.wordpress.com/wpcom/v2/full-site-editing/templates';

		$request_args = [
			'body' => [ 'theme_slug' => $this->theme_slug ],
		];

		$response = wp_remote_get( $request_url, $request_args );

		if ( is_wp_error( $response ) ) {
			return;
		}

		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );

		// Default to first returned header for now. Support for multiple headers will be added in future iterations.
		if ( ! empty( $api_response['headers'] ) ) {
			$this->header_content = $api_response['headers'][0];
		}

		// Default to first returned footer for now. Support for multiple footers will be added in future iterations.
		if ( ! empty( $api_response['footers'] ) ) {
			$this->footer_content = $api_response['footers'][0];
		}
	}

	/**
	 * This function will be called on plugin activation hook.
	 */
	public function insert_default_template_data() {
		/**
		 * This site option will be used to indicate that template data has already been
		 * inserted for this theme, in order to prevent this functionality from running
		 * more than once.
		 */
		$fse_template_data_option = $this->theme_slug . '-fse-template-data';

		if ( get_option( $fse_template_data_option ) ) {
			/*
			 * Bail here to prevent inserting the FSE data twice for any given theme.
			 * Multiple themes will still be able to insert different templates.
			 */
			return;
		}

		// Set header and footer content based on data fetched from the WP.com API.
		$this->fetch_template_parts();

		// Avoid creating template parts if data hasn't been fetched properly.
		if ( empty( $this->header_content ) || empty( $this->footer_content ) ) {
			return;
		}

		$this->register_wp_template();

		$header_id = wp_insert_post(
			[
				'post_title'     => 'Header',
				'post_content'   => $this->header_content,
				'post_status'    => 'publish',
				'post_type'      => 'wp_template',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			]
		);

		if ( ! term_exists( "$this->theme_slug-header", 'wp_template_type' ) ) {
			wp_insert_term( "$this->theme_slug-header", 'wp_template_type' );
		}

		wp_set_object_terms( $header_id, "$this->theme_slug-header", 'wp_template_type' );

		$footer_id = wp_insert_post(
			[
				'post_title'     => 'Footer',
				'post_content'   => $this->footer_content,
				'post_status'    => 'publish',
				'post_type'      => 'wp_template',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			]
		);

		if ( ! term_exists( "$this->theme_slug-footer", 'wp_template_type' ) ) {
			wp_insert_term( "$this->theme_slug-footer", 'wp_template_type' );
		}

		wp_set_object_terms( $footer_id, "$this->theme_slug-footer", 'wp_template_type' );

		add_option( $fse_template_data_option, true );
	}

	/**
	 * Register wp_template CPT and wp_template_type taxonomy.
	 */
	public function register_wp_template() {
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
}

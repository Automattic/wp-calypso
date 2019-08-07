<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_Template_Inserter
 */
class WP_Template_Inserter {
	/**
	 * Template header content.
	 *
	 * @var string $header_content
	 */
	private $header_content;

	/**
	 * Template footer content.
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
	 * This site option will be used to indicate that template data has already been
	 * inserted for this theme, in order to prevent this functionality from running
	 * more than once.
	 *
	 * @var string $fse_template_data_option
	 */
	private $fse_template_data_option;

	/**
	 * WP_Template_Inserter constructor.
	 *
	 * @param string $theme_slug Current theme slug.
	 */
	public function __construct( $theme_slug ) {
		$this->theme_slug     = $theme_slug;
		$this->header_content = '';
		$this->footer_content = '';

		/*
		 * Previously the option suffix was '-fse-template-data'. Bumping this to '-fse-template-data-v1'
		 * to differentiate it from the old data that was not provided by the API. Note that we don't want
		 * to tie this to plugin version constant, because that would trigger the insertion on each plugin
		 * update, even when it's not necessary (it would duplicate existing data).
		 */
		$this->fse_template_data_option = $this->theme_slug . '-fse-template-data-v1';
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
	 * Determines whether FSE data has already been inserted.
	 *
	 * @return bool True if FSE data has already been inserted, false otherwise.
	 */
	public function is_template_data_inserted() {
		return get_option( $this->fse_template_data_option ) ? true : false;
	}

	/**
	 * This function will be called on plugin activation hook.
	 */
	public function insert_default_template_data() {
		if ( $this->is_template_data_inserted() ) {
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

		$this->register_template_post_types();

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

		add_option( $this->fse_template_data_option, true );
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
				'show_ui'               => true, // Otherwise we'd get permission error when trying to edit them.
				'show_in_menu'          => false,
				'rewrite'               => false,
				'show_in_rest'          => true, // Otherwise previews won't be generated in full page view.
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

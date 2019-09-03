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
	 * This site option will be used to indicate that default page data has already been
	 * inserted for this theme, in order to prevent this functionality from running
	 * more than once.
	 *
	 * @var string $fse_page_data_option
	 */
	private $fse_page_data_option = 'fse-page-data-v1';

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

		$response = $this->fetch_retry( $request_url, $request_args );

		if ( ! $response ) {
			$this->log_template_error();
			$this->header_content = $this->get_default_header();
			$this->footer_content = $this->get_default_footer();
			return;
		}

		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );

		// Default to first returned header for now. Support for multiple headers will be added in future iterations.
		if ( ! empty( $api_response['headers'] ) ) {
			$this->header_content = $api_response['headers'][0];
		} else {
			$this->log_template_error( 'header' );
			$this->header_content = $this->get_default_header();
		}

		// Default to first returned footer for now. Support for multiple footers will be added in future iterations.
		if ( ! empty( $api_response['footers'] ) ) {
			$this->footer_content = $api_response['footers'][0];
		} else {
			$this->log_template_error( 'footer' );
			$this->footer_content = $this->get_default_footer();
		}
	}

	/**
	 * Retries a call to wp_remote_get on error.
	 *
	 * @param string $request_url Url of the api call to make.
	 * @param string $request_args Addtional arguments for the api call.
	 * @param int    $attempt The number of the attempt being made.
	 * @return array wp_remote_get reponse array
	 */
	private function fetch_retry( $request_url, $request_args = null, $attempt = 1 ) {
		$max_retries = 3;

		$response = wp_remote_get( $request_url, $request_args );

		if ( ! is_wp_error( $response ) ) {
			return $response;
		}

		if ( $attempt > $max_retries ) {
			return;
		}

		sleep( pow( 2, $attempt ) );
		$attempt++;
		$this->fetch_retry( $request_url, $request_args, $attempt );
	}

	/**
	 * Returns a default header if call to template api fails for some reason.
	 *
	 * @return string Content of a default header
	 */
	public function get_default_header() {
		return '<!-- wp:a8c/site-description /-->
			<!-- wp:a8c/site-title /-->
			<!-- wp:a8c/navigation-menu /-->
			<!-- wp:paragraph -->
				<p>' .
				__(
					'The theme did not activate correctly so it may not look identical to the demo site. 
				You are however able to edit the header and footer content to make it suit your needs.',
					'full-site-editing'
				)
				.
				'</p><!-- /wp:paragraph -->';
	}

	/**
	 * Returns a default footer if call to template api fails for some reason.
	 *
	 * @return string Content of a default footer
	 */
	public function get_default_footer() {
		return '<!-- wp:a8c/navigation-menu /--><!-- wp:paragraph -->
				<!-- /wp:paragraph -->';
	}

	/**
	 * Logs an error if the header and footer templates were not populated.
	 *
	 * @param string $templates Description of templates that failed.
	 */
	public function log_template_error( $templates = 'header and footer' ) {
		$message = sprintf( 'The FSE %s templates failed to populate at point of activation', $templates );

		if ( is_file( ABSPATH . 'wp-content/lib/log2logstash/log2logstash.php' ) ) {
			require_once ABSPATH . 'wp-content/lib/log2logstash/log2logstash.php';

			log2logstash(
				array(
					'feature'    => 'fse_template_population_failure',
					'message'    => $message,
					'blog_id'    => get_current_blog_id(),
					'theme_slug' => get_stylesheet(),
				)
			);
			return;
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
	 * Determines whether default pages have already been created.
	 *
	 * @return bool True if default pages have already been created, false otherwise.
	 */
	public function is_pages_data_inserted() {
		return get_option( $this->fse_page_data_option ) ? true : false;
	}

	/**
	 * Inserts default About and Contact pages based on Starter Page Templates content.
	 *
	 * The insertion will not happen if this data has been already inserted or if pages
	 * with 'About' and 'Contact' titles already exist.
	 */
	public function insert_default_pages() {
		// Bail if this data has already been inserted.
		if ( $this->is_pages_data_inserted() ) {
			return;
		}

		$request_url = add_query_arg(
			[
				'_locale' => $this->get_iso_639_locale(),
			],
			'https://public-api.wordpress.com/wpcom/v2/verticals/m1/templates'
		);

		$response = $this->fetch_retry( $request_url );

		if ( ! $response ) {
			return;
		}

		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );

		$about_page_content   = '';
		$contact_page_content = '';

		/*
		 * Array of returned templates is not keyed by name, so we have to access it directly like this.
		 * About page is at position 6 in the array, and Contact page at 1.
		 */
		if ( ! empty( $api_response['templates'][6]['content'] ) ) {
			$about_page_content = $api_response['templates'][6]['content'];
		}

		if ( ! empty( $api_response['templates'][1]['content'] ) ) {
			$contact_page_content = $api_response['templates'][1]['content'];
		}

		if ( empty( get_page_by_title( 'About' ) ) ) {
			wp_insert_post(
				[
					'post_title'   => _x( 'About', 'Default page title', 'full-site-editing' ),
					'post_content' => $about_page_content,
					'post_status'  => 'publish',
					'post_type'    => 'page',
				]
			);
		}

		if ( empty( get_page_by_title( 'Contact' ) ) ) {
			wp_insert_post(
				[
					'post_title'   => _x( 'Contact', 'Default page title', 'full-site-editing' ),
					'post_content' => $contact_page_content,
					'post_status'  => 'publish',
					'post_type'    => 'page',
				]
			);
		}

		update_option( $this->fse_page_data_option, true );
	}

	/**
	 * Returns ISO 639 conforming locale string.
	 *
	 * @return string ISO 639 locale string
	 */
	public function get_iso_639_locale() {
		$language = strtolower( get_locale() );

		if ( in_array( $language, [ 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn' ], true ) ) {
			$language = str_replace( '_', '-', $language );
		} else {
			$language = preg_replace( '/([-_].*)$/i', '', $language );
		}

		return $language;
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
				'publicly_queryable' => false,
				'show_ui'            => false,
				'show_in_menu'       => false,
				'show_in_nav_menu'   => false,
				'show_in_rest'       => true,
				'rest_base'          => 'template_types',
				'show_tagcloud'      => false,
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

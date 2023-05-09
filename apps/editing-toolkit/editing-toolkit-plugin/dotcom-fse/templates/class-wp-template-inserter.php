<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * The strategy to use for loading the default template part content.
 *
 * @typedef {string="use-api","use-local"} LoadingStrategy
 */

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
	 * Image URLs contained in the returned from the template API
	 *
	 * @var array $image_urls
	 */
	private $image_urls;

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
	 * The strategy to use for default data insertion.
	 *
	 * 'use-api' will use the wpcom API to get specifc content depending on the theme.
	 *
	 * 'use-local' will use the locally defined defaults.
	 *
	 * @var {LoadingStrategy} $loading_strategy
	 */
	private $loading_strategy;

	/**
	 * WP_Template_Inserter constructor.
	 *
	 * @param string            $theme_slug Current theme slug.
	 * @param {LoadingStrategy} $loading_strategy The strategy to use to load the template part content.
	 */
	public function __construct( $theme_slug, $loading_strategy = 'use-api' ) {
		$this->theme_slug       = $theme_slug;
		$this->header_content   = '';
		$this->footer_content   = '';
		$this->loading_strategy = $loading_strategy;

		/*
		 * Previously the option suffix was '-fse-template-data'. Bumping this to '-fse-template-data-v1'
		 * to differentiate it from the old data that was not provided by the API. Note that we don't want
		 * to tie this to plugin version constant, because that would trigger the insertion on each plugin
		 * update, even when it's not necessary (it would duplicate existing data).
		 */
		$this->fse_template_data_option = $this->theme_slug . '-fse-template-data-v1';
	}

	/**
	 * Retrieves template parts content.
	 */
	public function fetch_template_parts() {
		// Use default data if we don't want to fetch from the API.
		if ( 'use-local' === $this->loading_strategy ) {
			$this->header_content = $this->get_default_header();
			$this->footer_content = $this->get_default_footer();
			return;
		}

		$request_url = 'https://public-api.wordpress.com/wpcom/v2/full-site-editing/templates';

		$request_args = array(
			'body' => array( 'theme_slug' => $this->theme_slug ),
		);

		$response = $this->fetch_retry( $request_url, $request_args );

		if ( ! $response ) {
			do_action(
				'a8c_fse_log',
				'template_population_failure',
				array(
					'context'    => 'WP_Template_Inserter->fetch_template_parts',
					'error'      => 'Fetch retry timeout',
					'theme_slug' => $this->theme_slug,
				)
			);
			$this->header_content = $this->get_default_header();
			$this->footer_content = $this->get_default_footer();
			return;
		}

		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! empty( $api_response['code'] ) && 'not_found' === $api_response['code'] ) {
			do_action(
				'a8c_fse_log',
				'template_population_failure',
				array(
					'context'    => 'WP_Template_Inserter->fetch_template_parts',
					'error'      => 'Did not find remote template data for the given theme.',
					'theme_slug' => $this->theme_slug,
				)
			);
			return;
		}

		// Default to first returned header for now. Support for multiple headers will be added in future iterations.
		if ( ! empty( $api_response['headers'] ) ) {
			$this->header_content = $api_response['headers'][0];
		}

		// Default to first returned footer for now. Support for multiple footers will be added in future iterations.
		if ( ! empty( $api_response['footers'] ) ) {
			$this->footer_content = $api_response['footers'][0];
		}

		// This should contain all image URLs for images in any header or footer.
		if ( ! empty( $api_response['image_urls'] ) ) {
			$this->image_urls = $api_response['image_urls'];
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
			<!-- wp:a8c/navigation-menu /-->';
	}

	/**
	 * Returns a default footer if call to template api fails for some reason.
	 *
	 * @return string Content of a default footer
	 */
	public function get_default_footer() {
		return '<!-- wp:a8c/navigation-menu /-->';
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
		do_action(
			'a8c_fse_log',
			'before_template_population',
			array(
				'context'    => 'WP_Template_Inserter->insert_default_template_data',
				'theme_slug' => $this->theme_slug,
			)
		);

		if ( $this->is_template_data_inserted() ) {
			/*
			 * Bail here to prevent inserting the FSE data twice for any given theme.
			 * Multiple themes will still be able to insert different templates.
			 */
			do_action(
				'a8c_fse_log',
				'template_population_failure',
				array(
					'context'    => 'WP_Template_Inserter->insert_default_template_data',
					'error'      => 'Data already exist',
					'theme_slug' => $this->theme_slug,
				)
			);
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
			array(
				'post_title'     => 'Header',
				'post_content'   => $this->header_content,
				'post_status'    => 'publish',
				'post_type'      => 'wp_template_part',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			)
		);

		if ( ! term_exists( "$this->theme_slug-header", 'wp_template_part_type' ) ) {
			wp_insert_term( "$this->theme_slug-header", 'wp_template_part_type' );
		}

		wp_set_object_terms( $header_id, "$this->theme_slug-header", 'wp_template_part_type' );

		$footer_id = wp_insert_post(
			array(
				'post_title'     => 'Footer',
				'post_content'   => $this->footer_content,
				'post_status'    => 'publish',
				'post_type'      => 'wp_template_part',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			)
		);

		if ( ! term_exists( "$this->theme_slug-footer", 'wp_template_part_type' ) ) {
			wp_insert_term( "$this->theme_slug-footer", 'wp_template_part_type' );
		}

		wp_set_object_terms( $footer_id, "$this->theme_slug-footer", 'wp_template_part_type' );

		add_option( $this->fse_template_data_option, true );

		// Note: we set the option before doing the image upload because the template
		// parts can work with the remote URLs even if this fails.
		$image_urls = $this->image_urls;
		if ( ! empty( $image_urls ) ) {
			// Uploading images locally does not work in the WordPress.com environment,
			// so we use an action to handle it with Headstart there.
			if ( has_action( 'a8c_fse_upload_template_part_images' ) ) {
				do_action( 'a8c_fse_upload_template_part_images', $image_urls, array( $header_id, $footer_id ) );
			} else {
				$image_inserter = new Template_Image_Inserter();
				$image_inserter->copy_images_and_update_posts( $image_urls, array( $header_id, $footer_id ) );
			}
		}

		do_action(
			'a8c_fse_log',
			'template_population_success',
			array(
				'context'    => 'WP_Template_Inserter->insert_default_template_data',
				'theme_slug' => $this->theme_slug,
			)
		);
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
		do_action(
			'a8c_fse_log',
			'before_pages_population',
			array(
				'context'    => 'WP_Template_Inserter->insert_default_pages',
				'theme_slug' => $this->theme_slug,
			)
		);

		// Bail if this data has already been inserted.
		if ( $this->is_pages_data_inserted() ) {
			do_action(
				'a8c_fse_log',
				'pages_population_failure',
				array(
					'context'    => 'WP_Template_Inserter->insert_default_pages',
					'error'      => 'Data already exist',
					'theme_slug' => $this->theme_slug,
				)
			);
			return;
		}

		$request_url = add_query_arg(
			array(
				'_locale' => $this->get_template_locale(),
			),
			'https://public-api.wordpress.com/wpcom/v2/verticals/m1/templates'
		);

		$response = $this->fetch_retry( $request_url );

		if ( ! $response ) {
			do_action(
				'a8c_fse_log',
				'pages_population_failure',
				array(
					'context'    => 'WP_Template_Inserter->insert_default_pages',
					'error'      => 'Fetch retry timeout',
					'theme_slug' => $this->theme_slug,
				)
			);
			return;
		}

		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );

		// Convert templates response to [ slug => content ] pairs to extract required content more easily.
		$template_content_by_slug = wp_list_pluck( $api_response['templates'], 'content', 'slug' );

		if ( empty( get_page_by_title( 'About' ) ) && ! empty( $template_content_by_slug['about'] ) ) {
			wp_insert_post(
				array(
					'post_title'   => _x( 'About', 'Default page title', 'full-site-editing' ),
					'post_content' => $template_content_by_slug['about'],
					'post_status'  => 'publish',
					'post_type'    => 'page',
					'menu_order'   => 1,
				)
			);
		}

		if ( empty( get_page_by_title( 'Contact' ) ) && ! empty( $template_content_by_slug['contact'] ) ) {
			wp_insert_post(
				array(
					'post_title'   => _x( 'Contact', 'Default page title', 'full-site-editing' ),
					'post_content' => $template_content_by_slug['contact'],
					'post_status'  => 'publish',
					'post_type'    => 'page',
					'menu_order'   => 1,
				)
			);
		}

		update_option( $this->fse_page_data_option, true );

		do_action(
			'a8c_fse_log',
			'pages_population_success',
			array(
				'context'    => 'WP_Template_Inserter->insert_default_pages',
				'theme_slug' => $this->theme_slug,
			)
		);
	}

	/**
	 * Returns the locale to be used for page templates
	 */
	private function get_template_locale() {
		$language = get_locale();
		return \A8C\FSE\Common\get_iso_639_locale( $language );
	}

	/**
	 * Register post types.
	 */
	public function register_template_post_types() {
		register_post_type(
			'wp_template_part', // phpcs:ignore WordPress.NamingConventions.ValidPostTypeSlug.ReservedPrefix
			array(
				'labels'          => array(
					'name'                     => _x( 'Template Parts', 'post type general name', 'full-site-editing' ),
					'singular_name'            => _x( 'Template Part', 'post type singular name', 'full-site-editing' ),
					'menu_name'                => _x( 'Template Parts', 'admin menu', 'full-site-editing' ),
					'name_admin_bar'           => _x( 'Template Part', 'add new on admin bar', 'full-site-editing' ),
					'add_new'                  => _x( 'Add New', 'Template', 'full-site-editing' ),
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
				'menu_icon'       => 'dashicons-layout',
				'public'          => false,
				'show_ui'         => true, // Otherwise we'd get permission error when trying to edit them.
				'show_in_menu'    => false,
				'rewrite'         => false,
				'capability_type' => 'template_part',
				'capabilities'    => array(
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
				'map_meta_cap'    => true,
				'supports'        => array(
					'title',
					'editor',
					'revisions',
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
				'publicly_queryable' => false,
				'show_ui'            => false,
				'show_in_menu'       => false,
				'show_in_nav_menu'   => false,
				'show_in_rest'       => true,
				'rest_base'          => 'template_part_types',
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

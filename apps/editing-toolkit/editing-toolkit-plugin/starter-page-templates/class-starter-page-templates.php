<?php
/**
 * Starter page templates file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use function A8C\FSE\Common\get_iso_639_locale;

/**
 * Class Starter_Page_Templates
 */
class Starter_Page_Templates {

	/**
	 * Class instance.
	 *
	 * @var Starter_Page_Templates
	 */
	private static $instance = null;

	/**
	 * Cache key for templates array.
	 * Please access with the  ->get_templates_cache_key() getter.
	 *
	 * @var string
	 */
	public $templates_cache_key;

	/**
	 * Starter_Page_Templates constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_scripts' ) );
		add_action( 'init', array( $this, 'register_meta_field' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );
		add_action( 'delete_attachment', array( $this, 'clear_sideloaded_image_cache' ) );
		add_action( 'switch_theme', array( $this, 'clear_templates_cache' ) );
	}

	/**
	 * Gets the cache key for templates array, after setting it if it hasn't been set yet.
	 *
	 * @param string $locale The templates locale.
	 *
	 * @return string
	 */
	public function get_templates_cache_key( string $locale ) {
		if ( empty( $this->templates_cache_key ) ) {
			$this->templates_cache_key = implode(
				'_',
				array(
					'starter_page_templates',
					A8C_ETK_PLUGIN_VERSION,
					get_option( 'site_vertical', 'default' ),
				)
			);
		}

		return $this->templates_cache_key . '_' . $locale;
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Starter_Page_Templates
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register block editor scripts.
	 */
	public function register_scripts() {
		wp_register_script(
			'starter-page-templates',
			plugins_url( 'dist/starter-page-templates.min.js', __FILE__ ),
			array( 'wp-plugins', 'wp-edit-post', 'wp-element' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/starter-page-templates.min.js' ),
			true
		);
	}

	/**
	 * Register meta field for storing the template identifier.
	 */
	public function register_meta_field() {
		$args = array(
			'type'           => 'string',
			'description'    => 'Selected template',
			'single'         => true,
			'show_in_rest'   => true,
			'object_subtype' => 'page',
			'auth_callback'  => function () {
				return current_user_can( 'edit_posts' );
			},
		);
		register_meta( 'post', '_starter_page_template', $args );

		$args = array(
			'type'              => 'array',
			'description'       => 'Selected category',
			'show_in_rest'      => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array(
						'type' => 'string',
					),
				),
			),
			'single'            => true,
			'object_subtype'    => 'page',
			'auth_callback'     => function () {
				return current_user_can( 'edit_pages' );
			},
			'sanitize_callback' => function ( $meta_value ) {
				if ( ! is_array( $meta_value ) ) {
					return array();
				}

				if ( ! class_exists( '\A8C\FSE\Starter_Page_Templates' ) ) {
					return array();
				}

				$starter_page_templates = \A8C\FSE\Starter_Page_Templates::get_instance();
				// We need to pass a locale in here, but we don't actually depend on it, so we use the default site locale to optimise hitting the pattern cache for the site.
				$all_page_templates     = $starter_page_templates->get_page_templates( $starter_page_templates->get_verticals_locale() );
				$all_categories = array_merge( ...array_map( 'array_keys', wp_list_pluck( $all_page_templates, 'categories' ) ) );

				$unique_categories = array_unique( $all_categories );

				// Only permit values that are valid categories.
				return array_intersect( $meta_value, $unique_categories );
			},
		);
		register_meta( 'post', '_wpcom_template_layout_category', $args );
	}

	/**
	 * Register rest api endpoint for side-loading images.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-sideload-image-controller.php';

		( new WP_REST_Sideload_Image_Controller() )->register_routes();
	}

	/**
	 * Pass error message to frontend JavaScript console.
	 *
	 * @param string $message Error message.
	 */
	public function pass_error_to_frontend( $message ) {
		wp_register_script(
			'starter-page-templates-error',
			null,
			array(),
			'1.O',
			true
		);
		wp_add_inline_script(
			'starter-page-templates-error',
			sprintf(
				'console.warn(%s);',
				wp_json_encode( $message )
			)
		);
		wp_enqueue_script( 'starter-page-templates-error' );
	}

	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_assets() {
		$screen      = get_current_screen();
		$user_locale = get_iso_639_locale( get_user_locale() );

		// Return early if we don't meet conditions to show templates.
		if ( 'page' !== $screen->id ) {
			return;
		}

		// Load templates for this site.
		$page_templates = $this->get_page_templates( $this->get_verticals_locale() );
		if ( $user_locale !== $this->get_verticals_locale() ) {
			// If the user locale is not the blog locale, we should show labels in the user locale.
			$user_page_templates_indexed = array();
			$user_page_templates         = $this->get_page_templates( $user_locale );
			foreach ( $user_page_templates as $page_template ) {
				if ( ! empty( $page_template['ID'] ) ) {
					$user_page_templates_indexed[ $page_template['ID'] ] = $page_template;
				}
			}
			foreach ( $page_templates as $key => $page_template ) {
				if ( isset( $user_page_templates_indexed[ $page_template['ID'] ]['categories'] ) ) {
					$page_templates[ $key ]['categories'] = $user_page_templates_indexed[ $page_template['ID'] ]['categories'];
				}
				if ( isset( $user_page_templates_indexed[ $page_template['ID'] ]['description'] ) ) {
					$page_templates[ $key ]['description'] = $user_page_templates_indexed[ $page_template['ID'] ]['description'];
				}
			}
		}

		if ( empty( $page_templates ) ) {
			$this->pass_error_to_frontend( __( 'No data received from the vertical API. Skipped showing modal window with template selection.', 'full-site-editing' ) );
			return;
		}

		if ( empty( $page_templates ) ) {
			$this->pass_error_to_frontend( __( 'No templates available. Skipped showing modal window with template selection.', 'full-site-editing' ) );
			return;
		}

		wp_enqueue_script( 'starter-page-templates' );
		wp_set_script_translations( 'starter-page-templates', 'full-site-editing' );

		$default_templates = array(
			array(
				'ID'    => null,
				'title' => __( 'Blank', 'full-site-editing' ),
				'name'  => 'blank',
			),
			array(
				'ID'    => null,
				'title' => __( 'Current', 'full-site-editing' ),
				'name'  => 'current',
			),
		);

		$registered_page_templates = $this->get_registered_page_templates();

		/**
		 * Filters the config before it's passed to the frontend.
		 *
		 * @param array $config The config.
		 */
		$config = apply_filters(
			'fse_starter_page_templates_config',
			array(
				'templates'    => array_merge( $default_templates, $page_templates, $registered_page_templates ),
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'screenAction' => isset( $_GET['new-homepage'] ) ? 'add' : $screen->action,
			)
		);

		wp_localize_script( 'starter-page-templates', 'starterPageTemplatesConfig', $config );

		// Enqueue styles.
		$style_file = is_rtl()
			? 'starter-page-templates.rtl.css'
			: 'starter-page-templates.css';

		wp_enqueue_style(
			'starter-page-templates',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	/**
	 * Get page templates from the patterns API or return cached version if available.
	 *
	 * @param string $locale The templates locale.
	 *
	 * @return array Containing page templates or nothing if an error occurred.
	 */
	public function get_page_templates( string $locale ) {
		$page_template_data   = get_transient( $this->get_templates_cache_key( $locale ) );
		$override_source_site = apply_filters( 'a8c_override_patterns_source_site', false );

		// Load fresh data if we don't have any or vertical_id doesn't match.
		if ( false === $page_template_data || ( defined( 'WP_DEBUG' ) && WP_DEBUG ) || false !== $override_source_site ) {

			$request_url = esc_url_raw(
				add_query_arg(
					array(
						'site'         => $override_source_site,
						'tags'         => 'layout',
						'pattern_meta' => 'is_web',
					),
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $locale
				)
			);

			$args = array( 'timeout' => 20 );

			if ( function_exists( 'wpcom_json_api_get' ) ) {
				$response = wpcom_json_api_get( $request_url, $args );
			} else {
				$response = wp_remote_get( $request_url, $args );
			}

			if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
				return array();
			}

			$page_template_data = json_decode( wp_remote_retrieve_body( $response ), true );

			// Only save to cache if we have not overridden the source site.
			if ( false === $override_source_site ) {
				set_transient( $this->get_templates_cache_key( $locale ), $page_template_data, DAY_IN_SECONDS );
			}

			return $page_template_data;
		}

		return $page_template_data;
	}

	/**
	 * Deletes cached attachment data when attachment gets deleted.
	 *
	 * @param int $id Attachment ID of the attachment to be deleted.
	 */
	public function clear_sideloaded_image_cache( $id ) {
		$url = get_post_meta( $id, '_sideloaded_url', true );
		if ( ! empty( $url ) ) {
			delete_transient( 'fse_sideloaded_image_' . hash( 'crc32b', $url ) );
		}
	}

	/**
	 * Deletes cached templates data when theme switches.
	 */
	public function clear_templates_cache() {
		delete_transient( $this->get_templates_cache_key( $this->get_verticals_locale() ) );
	}

	/**
	 * Gets the locale to be used for fetching the site vertical
	 */
	public function get_verticals_locale() {
		// Make sure to get blog locale, not user locale.
		$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
		return get_iso_639_locale( $language );
	}

	/**
	 * Gets the registered page templates
	 */
	public function get_registered_page_templates() {
		$registered_page_templates = array();

		if ( class_exists( 'WP_Block_Patterns_Registry' ) ) {
			$registered_categories = $this->get_registered_categories();
			foreach ( \WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) {
				if ( ! array_key_exists( 'blockTypes', $pattern ) ) {
					continue;
				}

				$post_content_offset = array_search( 'core/post-content', $pattern['blockTypes'], true );
				if ( $post_content_offset !== false ) {
					$categories = array();
					foreach ( $pattern['categories'] as $category ) {
						$registered_category = $registered_categories[ $category ];
						if ( $registered_category ) {
							$categories[ $category ] = array(
								'slug'        => $registered_category['name'],
								'title'       => $registered_category['label'],
								'description' => $registered_category['description'],
							);
						}
					}

					$registered_page_templates[] = array(
						'ID'          => null,
						'title'       => $pattern['title'],
						'description' => $pattern['description'],
						'name'        => $pattern['name'],
						'html'        => $pattern['content'],
						'categories'  => $categories,
					);
				}
			}
		}

		return $registered_page_templates;
	}

	/**
	 * Gets the registered categories.
	 */
	public function get_registered_categories() {
		$registered_categories = array();

		if ( class_exists( 'WP_Block_Pattern_Categories_Registry' ) ) {
			foreach ( \WP_Block_Pattern_Categories_Registry::get_instance()->get_all_registered() as $category ) {
				$registered_categories[ $category['name'] ] = $category;
			}
		}

		return $registered_categories;
	}
}

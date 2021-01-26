<?php
/**
 * Starter page templates file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

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
	 *
	 * @var string
	 */
	public $templates_cache_key;

	/**
	 * Starter_Page_Templates constructor.
	 */
	private function __construct() {
		$this->templates_cache_key = implode(
			'_',
			array(
				'starter_page_templates',
				PLUGIN_VERSION,
				get_option( 'site_vertical', 'default' ),
				get_locale(),
			)
		);

		add_action( 'init', array( $this, 'register_scripts' ) );
		add_action( 'init', array( $this, 'register_meta_field' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );
		add_action( 'delete_attachment', array( $this, 'clear_sideloaded_image_cache' ) );
		add_action( 'switch_theme', array( $this, 'clear_templates_cache' ) );
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
			plugins_url( 'dist/starter-page-templates.js', __FILE__ ),
			array( 'wp-plugins', 'wp-edit-post', 'wp-element' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/starter-page-templates.js' ),
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
			'auth_callback'  => function() {
				return current_user_can( 'edit_posts' );
			},
		);
		register_meta( 'post', '_starter_page_template', $args );
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
		$screen = get_current_screen();

		// Return early if we don't meet conditions to show templates.
		if ( 'page' !== $screen->id ) {
			return;
		}

		// Load templates for this site.
		$page_templates = $this->get_page_templates();

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
		/**
		 * Filters the config before it's passed to the frontend.
		 *
		 * @param array $config The config.
		 */
		$config = apply_filters(
			'fse_starter_page_templates_config',
			array(
				'templates'          => array_merge( $default_templates, $page_templates ),
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'screenAction'       => isset( $_GET['new-homepage'] ) ? 'add' : $screen->action,
				'theme'              => normalize_theme_slug( get_stylesheet() ),
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'isFrontPage'        => isset( $_GET['post'] ) && get_option( 'page_on_front' ) === $_GET['post'],
				'hideFrontPageTitle' => get_theme_mod( 'hide_front_page_title' ),
				'locale'             => $this->get_verticals_locale(),
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
	 * @return array Containing page templates or nothing if an error occurred.
	 */
	public function get_page_templates() {
		$page_template_data = get_transient( $this->templates_cache_key );

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
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $this->get_verticals_locale()
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
				set_transient( $this->templates_cache_key, $page_template_data, DAY_IN_SECONDS );
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
		delete_transient( $this->templates_cache_key );
	}

	/**
	 * Gets the locale to be used for fetching the site vertical
	 */
	private function get_verticals_locale() {
		// Make sure to get blog locale, not user locale.
		$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
		return \A8C\FSE\Common\get_iso_639_locale( $language );
	}
}

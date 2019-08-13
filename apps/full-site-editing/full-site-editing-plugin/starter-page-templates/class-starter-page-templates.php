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
	 * Starter_Page_Templates constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'register_scripts' ] );
		add_action( 'init', [ $this, 'register_meta_field' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_assets' ] );
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
			[ 'wp-plugins', 'wp-edit-post', 'wp-element' ],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/starter-page-templates.js' ),
			true
		);
	}

	/**
	 * Register meta field for storing the template identifier.
	 */
	public function register_meta_field() {
		$args = [
			'type'           => 'string',
			'description'    => 'Selected template',
			'single'         => true,
			'show_in_rest'   => true,
			'object_subtype' => 'page',
			'auth_callback'  => function() {
				return current_user_can( 'edit_posts' );
			},
		];
		register_meta( 'post', '_starter_page_template', $args );
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
			[],
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
		if ( 'page' !== $screen->id || 'add' !== $screen->action ) {
			return;
		}

		// Load templates for this site.
		$vertical_data = $this->fetch_vertical_data();
		if ( empty( $vertical_data ) ) {
			$this->pass_error_to_frontend( __( 'No data received from the vertical API. Skipped showing modal window with template selection.', 'full-site-editing' ) );
			return;
		}
		$vertical           = $vertical_data['vertical'];
		$segment            = $vertical_data['segment'];
		$vertical_templates = $vertical_data['templates'];

		// Bail early if we have no templates to offer.
		if ( empty( $vertical_templates ) || empty( $vertical ) || empty( $segment ) ) {
			$this->pass_error_to_frontend( __( 'No templates available. Skipped showing modal window with template selection.', 'full-site-editing' ) );
			return;
		}

		wp_enqueue_script( 'starter-page-templates' );
		wp_set_script_translations( 'starter-page-templates', 'full-site-editing' );

		$default_info      = [
			'title'    => get_bloginfo( 'name' ),
			'vertical' => $vertical['name'],
		];
		$default_templates = [
			[
				'title' => 'Blank',
				'slug'  => 'blank',
			],
		];
		$site_info         = get_option( 'site_contact_info', [] );
		/**
		 * Filters the config before it's passed to the frontend.
		 *
		 * @param array $config The config.
		 */
		$config = apply_filters(
			'fse_starter_page_templates_config',
			[
				'siteInformation' => array_merge( $default_info, $site_info ),
				'templates'       => array_merge( $default_templates, $vertical_templates ),
				'vertical'        => $vertical,
				'segment'         => $segment,
			]
		);
		wp_localize_script( 'starter-page-templates', 'starterPageTemplatesConfig', $config );

		// Enqueue styles.
		$style_file = is_rtl()
			? 'starter-page-templates.rtl.css'
			: 'starter-page-templates.css';

		wp_enqueue_style(
			'starter-page-templates',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			[],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	/**
	 * Fetch vertical data from the API or return cached version if available.
	 *
	 * @return array Containing vertical name and template list or nothing if an error occurred.
	 */
	public function fetch_vertical_data() {
		$vertical_id        = get_option( 'site_vertical', 'default' );
		$transient_key      = implode( '_', [ 'starter_page_templates', PLUGIN_VERSION, $vertical_id, get_locale() ] );
		$vertical_templates = get_transient( $transient_key );

		// Load fresh data if we don't have any or vertical_id doesn't match.
		if ( false === $vertical_templates || ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ) {
			$request_url = add_query_arg(
				[
					'_locale' => $this->get_iso_639_locale(),
				],
				'https://public-api.wordpress.com/wpcom/v2/verticals/' . $vertical_id . '/templates'
			);
			$response    = wp_remote_get( esc_url_raw( $request_url ) );
			if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
				return [];
			}
			$vertical_templates = json_decode( wp_remote_retrieve_body( $response ), true );
			set_transient( $transient_key, $vertical_templates, DAY_IN_SECONDS );
		}

		return $vertical_templates;
	}

	/**
	 * Returns ISO 639 conforming locale string.
	 *
	 * @return string ISO 639 locale string
	 */
	private function get_iso_639_locale() {
		$language = strtolower( get_locale() );

		if ( in_array( $language, [ 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn' ], true ) ) {
			$language = str_replace( '_', '-', $language );
		} else {
			$language = preg_replace( '/([-_].*)$/i', '', $language );
		}

		return $language;
	}
}

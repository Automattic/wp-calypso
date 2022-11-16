<?php
/**
 * Help center
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Help_Center
 */
class Help_Center {
	/**
	 * Class instance.
	 *
	 * @var Help_Center
	 */
	private static $instance = null;

	/**
	 * Asset file.
	 *
	 * @var asset_file
	 */
	private $asset_file;

	/**
	 * Version number of the plugin.
	 *
	 * @var version
	 */
	private $version;

	/**
	 * Help_Center constructor.
	 */
	public function __construct() {
		$this->asset_file = include plugin_dir_path( __FILE__ ) . 'dist/help-center.asset.php';
		$this->version    = $this->asset_file['version'];

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_wp_admin_scripts' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Help_Center
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Acts as a feature flag, returning a boolean for whether we should show the next steps tutorial UI.
	 *
	 * @return boolean
	 */
	public static function is_next_steps_tutorial_enabled() {
		return apply_filters(
			'help_center_should_enable_next_steps_tutorial',
			false
		);
	}

	/**
	 * Enqueue Help Center assets.
	 */
	public function enqueue_script() {
		$script_dependencies = $this->asset_file['dependencies'];

		wp_enqueue_script(
			'help-center-script',
			plugins_url( 'dist/help-center.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$this->version,
			true
		);

		wp_enqueue_style(
			'help-center-style',
			plugins_url( 'dist/help-center' . ( is_rtl() ? '.rtl.css' : '.css' ), __FILE__ ),
			array(),
			$this->version
		);

		wp_localize_script(
			'help-center-script',
			'helpCenterLocale',
			\A8C\FSE\Common\get_iso_639_locale( determine_locale() )
		);

		// Adds feature flags for development.
		wp_add_inline_script(
			'help-center-script',
			'const helpCenterFeatureFlags = ' . wp_json_encode(
				array(
					'loadNextStepsTutorial' => self::is_next_steps_tutorial_enabled(),
				)
			),
			'before'
		);

		wp_localize_script(
			'help-center-script',
			'helpCenterData',
			array(
				'currentSite' => $this->get_current_site(),
			)
		);

		wp_set_script_translations( 'help-center-script', 'full-site-editing' );
	}

	/**
	 * Get current site details.
	 */
	public function get_current_site() {
		$site       = \Jetpack_Options::get_option( 'id' );
		$logo_id    = get_option( 'site_logo' );
		$products   = wpcom_get_site_purchases();
		$at_options = get_option( 'at_options' );
		$plan       = array_pop(
			array_filter(
				$products,
				function ( $product ) {
					return 'bundle' === $product->product_type;
				}
			)
		);

		return array(
			'ID'              => $site,
			'name'            => get_bloginfo( 'name' ),
			'URL'             => get_bloginfo( 'url' ),
			'plan'            => array(
				'product_slug' => $plan->product_slug,
			),
			'is_wpcom_atomic' => boolval( $at_options ),
			'jetpack'         => true === apply_filters( 'is_jetpack_site', false, $site ),
			'logo'            => array(
				'id'    => $logo_id,
				'sizes' => array(),
				'url'   => wp_get_attachment_image_src( $logo_id, 'thumbnail' )[0],
			),
		);
	}

	/**
	 * Register the Help Center endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-help-center-authenticate.php';
		$controller = new WP_REST_Help_Center_Authenticate();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-support-availability.php';
		$controller = new WP_REST_Help_Center_Support_Availability();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-search.php';
		$controller = new WP_REST_Help_Center_Search();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-fetch-post.php';
		$controller = new WP_REST_Help_Center_Fetch_Post();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-ticket.php';
		$controller = new WP_REST_Help_Center_Ticket();
		$controller->register_rest_route();
	}

	/**
	 * Add icon to WP-ADMIN admin bar.
	 */
	public function enqueue_wp_admin_scripts() {
		require_once ABSPATH . 'wp-admin/includes/screen.php';
		global $wp_admin_bar, $current_screen;

		$is_site_editor = ( function_exists( 'gutenberg_is_edit_site_page' ) && gutenberg_is_edit_site_page( $current_screen->id ) );

		if ( ! is_admin() || ! is_object( $wp_admin_bar ) || $is_site_editor || $current_screen->is_block_editor ) {
			return;
		}

		// Enqueue wp-component styles because they're not enqueued in wp-admin outside of the editor.
		if ( function_exists( 'gutenberg_url' ) ) {
			wp_enqueue_style(
				'wp-components',
				gutenberg_url( 'build/components/style' . ( is_rtl() ? '.rtl.css' : '.css' ) ),
				array( 'dashicons' ),
				$this->version
			);
		}

		// Crazy high number inorder to prevent Jetpack removing it
		// https://github.com/Automattic/jetpack/blob/30213ee594cd06ca27199f73b2658236fda24622/projects/plugins/jetpack/modules/masterbar/masterbar/class-masterbar.php#L196.
		add_action(
			'wp_before_admin_bar_render',
			function () {
				global $wp_admin_bar;

				wp_localize_script(
					'help-center-script',
					'helpCenterAdminBar',
					array(
						'isLoaded' => true,
					)
				);

				$wp_admin_bar->add_menu(
					array(
						'id'     => 'help-center',
						'title'  => file_get_contents( plugin_dir_path( __FILE__ ) . 'src/help-icon.svg', true ),
						'parent' => 'top-secondary',
						'meta'   => array(
							'html'  => '<div id="help-center-masterbar" />',
							'class' => 'menupop',
						),
					)
				);
			},
			100000
		);

		$this->enqueue_script();
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Help_Center', 'init' ) );

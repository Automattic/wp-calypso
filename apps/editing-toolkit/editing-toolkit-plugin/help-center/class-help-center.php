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
		global $wp_customize;

		if ( isset( $wp_customize ) ) {
			return;
		}

		$this->asset_file = include plugin_dir_path( __FILE__ ) . 'dist/help-center.asset.php';
		$this->version    = $this->asset_file['version'];

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_wp_admin_scripts' ), 100 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_wp_admin_scripts' ), 100 );
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
		$is_support_site = $this->is_support_site();

		if ( $is_support_site ) {
			$user_id = get_current_user_id();
			$user    = get_userdata( $user_id );
			$site    = $user->primary_blog;
			switch_to_blog( $site );
		} else {
			$site = \Jetpack_Options::get_option( 'id' );
		}

		$logo_id  = get_option( 'site_logo' );
		$products = wpcom_get_site_purchases();
		$plan     = array_pop(
			array_filter(
				$products,
				function ( $product ) {
					return 'bundle' === $product->product_type;
				}
			)
		);

		$return_data = array(
			'ID'               => $site,
			'name'             => get_bloginfo( 'name' ),
			'URL'              => get_bloginfo( 'url' ),
			'plan'             => array(
				'product_slug' => $plan->product_slug,
			),
			'is_wpcom_atomic'  => defined( 'IS_ATOMIC' ) && IS_ATOMIC,
			'jetpack'          => true === apply_filters( 'is_jetpack_site', false, $site ),
			'logo'             => array(
				'id'    => $logo_id,
				'sizes' => array(),
				'url'   => wp_get_attachment_image_src( $logo_id, 'thumbnail' )[0],
			),
			'launchpad_screen' => get_option( 'launchpad_screen' ),
			'site_intent'      => get_option( 'site_intent' ),
		);

		if ( $is_support_site ) {
			restore_current_blog();
		}

		return $return_data;
	}

	/**
	 * Register the Help Center endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-help-center-authenticate.php';
		$controller = new WP_REST_Help_Center_Authenticate();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-sibyl.php';
		$controller = new WP_REST_Help_Center_Sibyl();
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

		require_once __DIR__ . '/class-wp-rest-help-center-forum.php';
		$controller = new WP_REST_Help_Center_Forum();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-support-history.php';
		$controller = new WP_REST_Help_Center_Support_History();
		$controller->register_rest_route();
	}
	/**
	 * Returns true if the current site is a support site.
	 */
	public function is_support_site() {
		// Disable the Help Center in support sites for now. It may be causing issues with notifications.
		return false;
		// Disable for now: `return defined( 'WPCOM_SUPPORT_BLOG_IDS' ) && in_array( get_current_blog_id(), WPCOM_SUPPORT_BLOG_IDS, true )`.
	}

	/**
	 * Returns true if the admin bar is set.
	 */
	public function is_admin_bar() {
		global $wp_admin_bar;
		return is_object( $wp_admin_bar );
	}

	/**
	 * Returns true if the current screen is the site editor.
	 */
	public function is_site_editor() {
		global $current_screen;
		return ( function_exists( 'gutenberg_is_edit_site_page' ) && gutenberg_is_edit_site_page( $current_screen->id ) );
	}

	/**
	 * Returns true if the current screen if the block editor.
	 */
	public function is_block_editor() {
		global $current_screen;
		return $current_screen->is_block_editor;
	}

	/**
	 * Add icon to WP-ADMIN admin bar.
	 */
	public function enqueue_wp_admin_scripts() {

		require_once ABSPATH . 'wp-admin/includes/screen.php';

		if ( ( ! $this->is_support_site() ) && ( ! is_admin() || ! $this->is_admin_bar() || $this->is_site_editor() || $this->is_block_editor() ) ) {
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

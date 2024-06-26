<?php
/**
 * Help center
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use Automattic\Jetpack\Connection\Manager as Connection_Manager;

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

		if ( ! function_exists( 'wpcom_get_site_purchases' ) ) {
			return;
		}

		$file             = $this->is_jetpack_disconnected() ? 'dist/help-center-disconnected.asset.php' : 'dist/help-center.asset.php';
		$this->asset_file = include plugin_dir_path( __FILE__ ) . $file;
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
		if ( self::$instance === null ) {
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

		// If the user is not connected, the Help Center icon will link to the support page.
		// The disconnected version is significantly smaller than the connected version.
		wp_enqueue_script(
			'help-center-script',
			plugins_url( $this->is_jetpack_disconnected() ? 'dist/help-center-disconnected.min.js' : 'dist/help-center.min.js', __FILE__ ),
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
			array(
				'locale' => \A8C\FSE\Common\get_iso_639_locale( determine_locale() ),
			)
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

		$user_id      = get_current_user_id();
		$user_data    = get_userdata( $user_id );
		$username     = $user_data->user_login;
		$user_email   = $user_data->user_email;
		$display_name = $user_data->display_name;
		$avatar_url   = function_exists( 'wpcom_get_avatar_url' ) ? wpcom_get_avatar_url( $user_email, 64, '', true )[0] : get_avatar_url( $user_id );

		wp_add_inline_script(
			'help-center-script',
			'const helpCenterData = ' . wp_json_encode(
				array(
					'currentUser' => array(
						'ID'           => $user_id,
						'username'     => $username,
						'display_name' => $display_name,
						'avatar_URL'   => $avatar_url,
						'email'        => $user_email,
					),
					'site'        => $this->get_current_site(),
					'locale'      => get_locale(),
				)
			),
			'before'
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
			/*
			 * Atomic sites have the WP.com blog ID stored as a Jetpack option. This code deliberately
			 * doesn't use `Jetpack_Options::get_option` so it works even when Jetpack has not been loaded.
			 */
			$jetpack_options = get_option( 'jetpack_options' );
			if ( is_array( $jetpack_options ) && isset( $jetpack_options['id'] ) ) {
				$site = (int) $jetpack_options['id'];
			} else {
				$site = get_current_blog_id();
			}
		}

		$logo_id = get_option( 'site_logo' );
		$bundles = wp_list_filter( wpcom_get_site_purchases(), array( 'product_type' => 'bundle' ) );
		$plan    = array_pop( $bundles );

		$return_data = array(
			'ID'              => $site,
			'name'            => get_bloginfo( 'name' ),
			'URL'             => get_bloginfo( 'url' ),
			'plan'            => array(
				'product_slug' => isset( $plan->product_slug ) ? $plan->product_slug : null,
			),
			'is_wpcom_atomic' => defined( 'IS_ATOMIC' ) && IS_ATOMIC,
			'jetpack'         => true === apply_filters( 'is_jetpack_site', false, $site ),
			'logo'            => array(
				'id'    => $logo_id,
				'sizes' => array(),
				'url'   => wp_get_attachment_image_src( $logo_id, 'thumbnail' )[0] ?? '',
			),
			'options'         => array(
				'launchpad_screen' => get_option( 'launchpad_screen' ),
				'site_intent'      => get_option( 'site_intent' ),
				'admin_url'        => get_admin_url(),
			),
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

		require_once __DIR__ . '/class-wp-rest-help-center-support-status.php';
		$controller = new WP_REST_Help_Center_Support_Status();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-search.php';
		$controller = new WP_REST_Help_Center_Search();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-jetpack-search-ai.php';
		$controller = new WP_REST_Help_Center_Jetpack_Search_AI();
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

		require_once __DIR__ . '/class-wp-rest-help-center-support-activity.php';
		$controller = new WP_REST_Help_Center_Support_Activity();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-user-fields.php';
		$controller = new WP_REST_Help_Center_User_Fields();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-odie.php';
		$controller = new WP_REST_Help_Center_Odie();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-email-support-enabled.php';
		$controller = new WP_REST_Help_Center_Email_Support_Enabled();
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
	 * Returns true if the current user is connected through Jetpack
	 */
	public function is_jetpack_disconnected() {
		$user_id = get_current_user_id();
		$blog_id = get_current_blog_id();

		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			return ! ( new Connection_Manager( 'jetpack' ) )->is_user_connected( $user_id );
		}

		if ( true === apply_filters( 'is_jetpack_site', false, $blog_id ) ) {
			return ! ( new Connection_Manager( 'jetpack' ) )->is_user_connected( $user_id );
		}

		return false;
	}

	/**
	 * Returns the URL for the Help Center redirect.
	 * Used for the Help Center when disconnected.
	 */
	public function get_help_center_url() {
		// phpcs:ignore WPCOM.I18nRules.LocalizedUrl.LocalizedUrlAssignedToVariable
		$help_url = 'https://wordpress.com/help';

		if ( ! $this->is_jetpack_disconnected() ) {
			return false;
		}

		if ( function_exists( 'localized_wpcom_url' ) ) {
			return localized_wpcom_url( $help_url );
		}

		return $help_url;
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

		// Crazy high number to prevent Jetpack removing it
		// https://github.com/Automattic/jetpack/blob/30213ee594cd06ca27199f73b2658236fda24622/projects/plugins/jetpack/modules/masterbar/masterbar/class-masterbar.php#L196.
		add_action(
			'wp_before_admin_bar_render',
			function () {
				global $wp_admin_bar;

				wp_add_inline_script(
					'help-center-script',
					'helpCenterData.isAdminBar = true;',
					'before'
				);

				$wp_admin_bar->add_menu(
					array(
						'id'     => 'help-center',
						'title'  => file_get_contents( plugin_dir_path( __FILE__ ) . 'src/help-icon.svg', true ),
						'parent' => 'top-secondary',
						'href'   => $this->get_help_center_url(),
						'meta'   => array(
							'html'   => '<div id="help-center-masterbar" />',
							'class'  => 'menupop',
							'target' => '_blank',
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

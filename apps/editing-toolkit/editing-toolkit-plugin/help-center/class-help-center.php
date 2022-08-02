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
	 * Help_Center constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
		add_action( 'admin_head', array( $this, 'admin_bar_menu' ), 110 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ), 100 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_wp_components_styles' ), 100 );
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
	 * Enqueue wp-component styles because they're not enqueued in wp-admin outside of the editor
	 */
	public function enqueue_wp_components_styles() {
		if ( function_exists( 'gutenberg_url' ) ) {
			wp_enqueue_style(
				'wp-components',
				gutenberg_url( 'build/components/style'. ( is_rtl() ? '.rtl.css' : '.css' )),
				array( 'dashicons' ),
				$version
			);
		}
	}
	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_script() {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/help-center.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'help-center-script',
			plugins_url( 'dist/help-center.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_enqueue_style(
			'help-center-style',
			plugins_url( 'dist/help-center' . ( is_rtl() ? '.rtl.css' : '.css' ), __FILE__ ),
			array(),
			$version
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
			'helpCenter',
			array(
				'currentSiteId' => get_current_blog_id(),
			)
		);

		wp_set_script_translations( 'help-center-script', 'full-site-editing' );
	}

	/**
	 * Register the Help Center endpoints.
	 */
	public function register_rest_api() {
		require_once __DIR__ . '/class-wp-rest-help-center-support-availability.php';
		$controller = new WP_REST_Help_Center_Support_Availability();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-search.php';
		$controller = new WP_REST_Help_Center_Search();
		$controller->register_rest_route();

		require_once __DIR__ . '/class-wp-rest-help-center-fetch-post.php';
		$controller = new WP_REST_Help_Center_Fetch_Post();
		$controller->register_rest_route();
	}

	/**
	 * Add icon to WP-ADMIN admin bar
	 */
	public function admin_bar_menu() {
		global $wp_admin_bar;

		$current_screen = get_current_screen();
		$is_site_editor = ( function_exists( 'gutenberg_is_edit_site_page' ) && gutenberg_is_edit_site_page( $current_screen->id ) );
		if ( ! is_object( $wp_admin_bar ) || $is_site_editor || $current_screen->is_block_editor() ) {
			return;
		}

		wp_localize_script(
			'help-center-script',
			'helpCenterAdminBar',
			array(
				'isLoaded' => true,
			)
		);

		$wp_admin_bar->add_menu(
			array(
				'id'     => 'help',
				'title'  => file_get_contents( plugin_dir_path( __FILE__ ) . 'src/help-icon.svg', true ),
				'parent' => 'top-secondary',
				'meta'   => array(
					'html' => '<div id="help-center-masterbar" />',
				),
			)
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Help_Center', 'init' ) );

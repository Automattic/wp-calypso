<?php
/**
 * Global Styles file.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

/**
 * Class Global_Styles
 */
class Global_Styles {

	/**
	 * Class instance.
	 *
	 * @var \Automattic\Jetpack\Global_Styles\Global_Styles
	 */
	private static $instance = null;

	/**
	 * Holds the internal data description to be exposed through REST API.
	 *
	 * @var \Automattic\Jetpack\Global_Styles\Data_Set
	 */
	private $rest_api_data;

	/**
	 * Namespace to use for the REST Endpoint.
	 * This can be overrided at initialization.
	 *
	 * @var string
	 */
	private $rest_namespace = 'jetpack-global-styles/v1';

	/**
	 * Route to use for the REST Route.
	 * This can be overrided at initialization.
	 *
	 * @var string
	 */
	private $rest_route = 'options';

	/**
	 * Path the client will use to work with the options.
	 * This can be overrided at initialization.
	 *
	 * @var string
	 */
	private $rest_path_client = 'jetpack-global-styles/v1/options';

	/**
	 * Undocumented variable
	 *
	 * @var string
	 */
	private $theme_support = 'jetpack-global-styles';

	/**
	 * Undocumented variable
	 *
	 * @var string
	 */
	private $option_name = 'jetpack_global_styles';

	/**
	 * Undocumented variable
	 *
	 * @var string
	 */
	private $redux_store_name = 'jetpack/global-styles';

	/**
	 * Undocumented variable
	 *
	 * @var string
	 */
	private $plugin_name = 'jetpack-global-styles';

	/**
	 * The provider's root URL for retrieving font CSS.
	 *
	 * @var string
	 */
	private $root_url = 'https://fonts.googleapis.com/css';

	const VERSION = '2003121439';

	const SYSTEM_FONT     = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
	const AVAILABLE_FONTS = array(
		array(
			'label' => 'Theme Default',
			'value' => 'unset',
		),
		array(
			'label' => 'System Font',
			'value' => self::SYSTEM_FONT,
		),
		'Arvo',
		'Bodoni Moda',
		'Cabin',
		'Chivo',
		'Courier Prime',
		'DM Sans',
		'Domine',
		'EB Garamond',
		'Fira Sans',
		'Inter',
		'Josefin Sans',
		'Libre Baskerville',
		'Libre Franklin',
		'Lora',
		'Merriweather',
		'Montserrat',
		'Nunito',
		'Open Sans',
		'Overpass',
		'Playfair Display',
		'Poppins',
		'Raleway',
		'Roboto',
		'Roboto Slab',
		'Rubik',
		'Source Sans Pro',
		'Source Serif Pro',
		'Space Mono',
		'Work Sans',
	);

	/**
	 * Creates instance.
	 *
	 * @return \Automattic\Jetpack\Global_Styles\Global_Styles
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Global Styles setup.
	 */
	public function __construct() {
		$this->update_plugin_settings();

		// DATA TO EXPOSE THROUGH THE REST API.
		require_once __DIR__ . '/includes/class-data-set.php';
		$this->rest_api_data = new Data_Set(
			array(
				'blogname'              => array(
					'type'    => 'option',
					'name'    => 'blogname',
					'default' => 'Your site name',
				),
				'font_base'             => array(
					'type'      => 'option',
					'name'      => array( 'jetpack_global_styles', 'font_base' ),
					'default'   => 'unset',
					'updatable' => true,
				),
				'font_headings'         => array(
					'type'      => 'option',
					'name'      => array( 'jetpack_global_styles', 'font_headings' ),
					'default'   => 'unset',
					'updatable' => true,
				),
				'font_base_default'     => array(
					'type'    => 'theme',
					'name'    => array( 'jetpack-global-styles', 'font_base' ),
					'default' => self::SYSTEM_FONT,
				),
				'font_headings_default' => array(
					'type'    => 'theme',
					'name'    => array( 'jetpack-global-styles', 'font_headings' ),
					'default' => self::SYSTEM_FONT,
				),
				'font_options'          => array(
					'type'    => 'literal',
					'default' => self::AVAILABLE_FONTS,
				),
				'font_pairings'         => array(
					'type'    => 'literal',
					'default' => array(
						array(
							'label'    => 'Playfair Display / Fira Sans',
							'headings' => 'Playfair Display',
							'base'     => 'Fira Sans',
						),
						array(
							'label'    => 'Cabin / Raleway',
							'headings' => 'Cabin',
							'base'     => 'Raleway',
						),
						array(
							'label'    => 'Chivo / Open Sans',
							'headings' => 'Chivo',
							'base'     => 'Open Sans',
						),
						array(
							'label'    => 'Arvo / Montserrat',
							'headings' => 'Arvo',
							'base'     => 'Montserrat',
						),
						array(
							'label'    => 'Space Mono / Roboto',
							'headings' => 'Space Mono',
							'base'     => 'Roboto',
						),
						array(
							'label'    => 'Bodoni Moda / Overpass',
							'headings' => 'Bodoni Moda',
							'base'     => 'Overpass',
						),
						array(
							'label'    => 'Inter / Source Serif Pro',
							'headings' => 'Inter',
							'base'     => 'Source Serif Pro',
						),
					),
				),
			)
		);

		// Setup REST API for the editor. Some environments (WordPress.com)
		// may not load the theme functions for REST API calls,
		// so we need to initialize it independently of theme support.
		add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );

		add_filter( 'jetpack_global_styles_data_set_get_data', array( $this, 'maybe_filter_font_list' ) );
		add_filter( 'jetpack_global_styles_data_set_save_data', array( $this, 'filter_and_validate_font_options' ) );

		// Setup editor.
		if ( $this->can_use_global_styles() ) {
			add_action(
				'enqueue_block_editor_assets',
				array( $this, 'enqueue_block_editor_assets' )
			);
			add_filter(
				'block_editor_settings',
				array( $this, 'block_editor_settings' ),
				PHP_INT_MAX // So it runs last and overrides any style provided by the theme.
			);
			add_action( 'customize_register', array( $this, 'register_customizer_option' ) );
		}

		// Setup front-end.
		add_action(
			'wp_enqueue_scripts',
			array( $this, 'wp_enqueue_scripts' ),
			PHP_INT_MAX // So it runs last and overrides any style provided by the theme.
		);
	}

	/**
	 * Register customizer modifications
	 * Add the 'Font' section to customizer.
	 *
	 * @param WP_Customize_Manager $wp_customize an instance of WP_Customize_Manager.
	 */
	public function register_customizer_option( $wp_customize ) {
		require_once __DIR__ . '/class-global-styles-fonts-message-control.php';

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_tracks_events_fonts_section_control' ) );

		$wp_customize->add_section(
			'global_styles_fonts_section',
			array(
				'title' => __( 'Fonts', 'full-site-editing' ),
			)
		);

		$wp_customize->add_control(
			new Global_Styles_Fonts_Message_Control(
				$wp_customize,
				'global_styles_fonts_message_control',
				array(
					'section'  => 'global_styles_fonts_section',
					'settings' => array(),
				)
			)
		);
	}

	/**
	 * Enqueue script customizer_fonts which executes tracks events when clicking the block editor and support links from the 'Fonts' section.
	 */
	public function enqueue_tracks_events_fonts_section_control() {
		$handle = 'tracks_events_fonts_section_control';
		$src    = plugins_url( 'dist/customizer-fonts.min.js', __FILE__ );
		$deps   = array();

		wp_enqueue_script(
			$handle,
			$src,
			$deps,
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/customizer-fonts.min.js' ),
			true
		);

		$current_user       = wp_get_current_user();
		$tracks_events_data = array();
		if ( $current_user->exists() ) {
			$tracks_events_data['user_id']    = (int) $current_user->ID;
			$tracks_events_data['user_login'] = esc_js( $current_user->user_login );
		}

		wp_localize_script(
			'tracks_events_fonts_section_control',
			'tracks_events_fonts_section_control_variables',
			$tracks_events_data
		);
	}

	/**
	 * Let 3rd parties configure plugin settings.
	 */
	private function update_plugin_settings() {
		$settings = apply_filters(
			'jetpack_global_styles_settings',
			array(
				// Server-side settings.
				'rest_namespace'   => $this->rest_namespace,
				'rest_route'       => $this->rest_route,
				'theme_support'    => $this->theme_support,
				'option_name'      => $this->option_name,
				// Client-side settings.
				'rest_path_client' => $this->rest_path_client,
				'redux_store_name' => $this->redux_store_name,
				'plugin_name'      => $this->plugin_name,
			)
		);

		$this->rest_namespace   = $settings['rest_namespace'];
		$this->rest_route       = $settings['rest_route'];
		$this->theme_support    = $settings['theme_support'];
		$this->option_name      = $settings['option_name'];
		$this->rest_path_client = $settings['rest_path_client'];
		$this->redux_store_name = $settings['redux_store_name'];
		$this->plugin_name      = $settings['plugin_name'];
	}

	/**
	 * Initialize REST API endpoint.
	 */
	public function rest_api_init() {
		require_once __DIR__ . '/includes/class-json-endpoint.php';
		$rest_api = new JSON_Endpoint(
			$this->rest_namespace,
			$this->rest_route,
			$this->rest_api_data,
			array( $this, 'can_use_global_styles' )
		);
		$rest_api->setup();
	}

	/**
	 * Whether we should load Global Styles
	 * per this user and site.
	 *
	 * @return boolean
	 */
	public function can_use_global_styles() {
		return is_user_logged_in() &&
			current_user_can( 'customize' ) &&
			current_theme_supports( $this->theme_support ) &&
			apply_filters( 'jetpack_global_styles_permission_check_additional', true );
	}

	/**
	 * We want the front-end styles enqueued in the editor
	 * and wrapped by the .editor-styles-wrapper class,
	 * so they don't bleed into other parts of the editor.
	 *
	 * We also want the global styles to override the theme's stylesheet.
	 * We do so by hooking into the block_editor_settings
	 * and append this style the last.
	 *
	 * @param array $settings The editor settings.
	 *
	 * @return $settings array with the inline styles added.
	 */
	public function block_editor_settings( $settings ) {
		if ( empty( $settings['styles'] ) || ! is_array( $settings['styles'] ) ) {
			$settings['styles'] = array();
		}

		// Append them last, so it overrides any existing inline styles.
		$settings['styles'][] = array(
			'css' => $this->get_inline_css(),
		);

		return $settings;
	}

	/**
	 * Enqueues the assets for the editor.
	 *
	 * @return void
	 */
	public function enqueue_block_editor_assets() {
		$asset_file   = plugin_dir_path( __FILE__ ) . 'dist/global-styles.asset.php';
		$asset        = file_exists( $asset_file )
			? require $asset_file
			: null;
		$dependencies = isset( $asset['dependencies'] ) ?
			$asset['dependencies'] :
			array();
		$version      = isset( $asset['version'] ) ?
			$asset['version'] :
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/global-styles.min.js' );

		wp_enqueue_script(
			'jetpack-global-styles-editor-script',
			plugins_url( 'dist/global-styles.min.js', __FILE__ ),
			$dependencies,
			$version,
			true
		);
		wp_set_script_translations( 'jetpack-global-styles-editor-script', 'full-site-editing' );
		wp_localize_script(
			'jetpack-global-styles-editor-script',
			'JETPACK_GLOBAL_STYLES_EDITOR_CONSTANTS',
			array(
				'PLUGIN_NAME' => $this->plugin_name,
				'REST_PATH'   => $this->rest_path_client,
				'STORE_NAME'  => $this->redux_store_name,
			)
		);
		wp_enqueue_style(
			'jetpack-global-styles-editor-style',
			plugins_url( 'dist/global-styles.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/global-styles.css' )
		);
	}

	/**
	 * Enqueues the assets for front-end.
	 *
	 * We want the global styles to override the theme's stylesheet,
	 * that's why they are inlined.
	 *
	 * @return void
	 */
	public function wp_enqueue_scripts() {
		wp_register_style(
			'jetpack-global-styles-frontend-style',
			false,
			array(),
			true,
			true
		);
		wp_add_inline_style( 'jetpack-global-styles-frontend-style', $this->get_inline_css( true ) );
		wp_enqueue_style( 'jetpack-global-styles-frontend-style' );
	}

	/**
	 * Prepare the inline CSS.
	 *
	 * @param boolean $only_selected_fonts Whether it should load all the fonts or only the selected. False by default.
	 * @return string
	 */
	private function get_inline_css( $only_selected_fonts = false ) {
		/**
		 * Filters the Google Fonts API URL.
		 *
		 * @param string $url The Google Fonts API URL.
		 */
		$root_url = esc_url( apply_filters( 'jetpack_global_styles_google_fonts_api_url', $this->root_url ) );

		$result = '';

		$data = $this->rest_api_data->get_data();

		/*
		 * Add the fonts we need:
		 *
		 * - all of them for the backend
		 * - only the selected ones for the frontend
		 */
		$font_list = array();
		// We want $font_list to only contain valid Google Font values,
		// so we filter out things like 'unset' on the system font.
		$font_values = array_diff( $this->get_font_values( $data['font_options'] ), array( 'unset', self::SYSTEM_FONT ) );
		if ( true === $only_selected_fonts ) {
			foreach ( array( 'font_base', 'font_base_default', 'font_headings', 'font_headings_default' ) as $key ) {
				if ( in_array( $data[ $key ], $font_values, true ) ) {
					$font_list[] = $data[ $key ];
				}
			}
		} else {
			$font_list = $font_values;
		}

		if ( count( $font_list ) > 0 ) {
			$font_list_str = '';
			foreach ( $font_list as $font ) {
				// Some fonts lack italic variants,
				// the API will return only the regular and bold CSS for those.
				$font_list_str = $font_list_str . $font . ':thin,extralight,light,regular,medium,semibold,bold,italic,bolditalic,extrabold,black|';
			}
			$result = $result . "@import url('" . $root_url . '?family=' . $font_list_str . "');";
		}

		/*
		 * Add the CSS custom properties.
		 *
		 * Note that we transform var_name into var-name,
		 * so the output is:
		 *
		 * :root{
		 *     --var-name-1: value;
		 *     --var-name-2: value;
		 * }
		 *
		 */
		$result = $result . ':root {';
		$value  = '';
		$keys   = array( 'font_headings', 'font_base', 'font_headings_default', 'font_base_default' );
		foreach ( $keys as $key ) {
			$value  = $data[ $key ];
			$result = $result . ' --' . str_replace( '_', '-', $key ) . ': ' . $value . ';';
		}
		$result = $result . '}';

		/*
		 * If the theme opts-in, also add a default stylesheet
		 * that uses the CSS custom properties.
		 *
		 * This is a fallback mechanism in case there are themes
		 * we don't want to / can't migrate to use CSS vars.
		 */
		$theme_defaults = get_theme_support( $this->theme_support );
		if ( is_array( $theme_defaults ) ) {
			$theme_defaults = $theme_defaults[0];
		}

		if (
			is_array( $theme_defaults ) &&
			array_key_exists( 'enqueue_experimental_styles', $theme_defaults ) &&
			true === $theme_defaults['enqueue_experimental_styles']
		) {
			$result = $result . file_get_contents( plugin_dir_path( __FILE__ ) . 'static/style.css', true );
		}

		return $result;
	}

	/**
	 * Callback for get data filter.
	 *
	 * @param array $result Data to be sent through the REST API.
	 *
	 * @return array Filtered result.
	 */
	public function maybe_filter_font_list( $result ) {
		$theme_defaults = get_theme_support( $this->theme_support );
		if ( is_array( $theme_defaults ) ) {
			$theme_defaults = $theme_defaults[0];
		}

		if (
			array_key_exists( 'font_options', $result ) &&
			(
				! is_array( $theme_defaults ) ||
				! array_key_exists( 'enable_theme_default', $theme_defaults ) ||
				true !== $theme_defaults['enable_theme_default']
			)
		) {
			$result['font_options'] = array_slice( $result['font_options'], 1 );
		}

		return $result;
	}

	/**
	 * Return the list of available font values.
	 *
	 * @param array $font_list Array of fonts to process.
	 * @return array Font values.
	 */
	private function get_font_values( $font_list ) {
		$font_values = array();
		foreach ( $font_list as $font ) {
			if ( is_array( $font ) ) {
				$font_values[] = $font['value'];
			} else {
				$font_values[] = $font;
			}
		}
		return $font_values;
	}

	/**
	 * Callback for save data filter.
	 *
	 * @param array $incoming_data The data to validate.
	 * @return array Filtered result.
	 */
	public function filter_and_validate_font_options( $incoming_data ) {
		$result = array();

		$font_values = $this->get_font_values( self::AVAILABLE_FONTS );
		foreach ( array( 'font_base', 'font_headings' ) as $key ) {
			if (
				array_key_exists( $key, $incoming_data ) &&
				in_array( $incoming_data[ $key ], $font_values, true )
			) {
				$result[ $key ] = $incoming_data[ $key ];
			}
		}

		return $result;
	}
}

add_action( 'init', array( __NAMESPACE__ . '\Global_Styles', 'init' ) );

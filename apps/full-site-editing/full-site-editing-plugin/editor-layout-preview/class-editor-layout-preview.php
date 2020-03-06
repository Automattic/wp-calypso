<?php
/**
 * Layout Preview file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Editor_Layout_Preview
 */
class Editor_Layout_Preview {

	/**
	 * Class instance.
	 *
	 * @var Editor_Layout_Preview
	 */
	private static $instance = null;

	/**
	 * Script handler name.
	 *
	 * @var string Script handler name
	 */
	private static $script_handler = 'editor-layout-preview';

	/**
	 * Editor_Layout_Preview constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_editor_layout_preview_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'editor_layout_preview_assets' ) );
	}

	/**
	 * Creates instance.
	 *
	 * @return Editor_Layout_Preview
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Adds the Editor Layout Preview page to the admin.
	 */
	public function add_editor_layout_preview_page() {
		add_options_page(
			'Editor Large Preview',
			'Editor Large Preview',
			'manage_options',
			'editor-layout-preview',
			array( $this, 'render_editor_layout_preview_content' )
		);
	}

	/**
	 * Load plugin assets.
	 *
	 * @param @string $hook Page hook.
	 */
	public function editor_layout_preview_assets( $hook ) {
		// Exit if not the correct page.
		if ( 'settings_page_editor-layout-preview' !== $hook ) {
			return;
		}

		$script_path       = 'dist/' . self::$script_handler . '.js';
		$script_asset_path = dirname( __FILE__ ) . '/dist/' . self::$script_handler . '.asset.php';
		$script_asset      = file_exists( $script_asset_path )
			? require $script_asset_path
			: array(
				'dependencies' => array( 'wp-plugins', 'wp-edit-post', 'wp-element' ),
				'version'      => filemtime( $script_path ),
			);

		wp_enqueue_script(
			self::$script_handler,
			plugins_url( $script_path, __FILE__ ),
			$script_asset['dependencies'],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/editor-layout-preview.js' ),
			true
		);

		// Inline the Editor Settings.
		$settings = $this->get_editor_layout_preview_settings();
		wp_add_inline_script( self::$script_handler, 'window.editor_layout_preview = ' . wp_json_encode( $settings ) . ';' );

		// Editor default styles.
		wp_enqueue_style( 'wp-format-library' );

		wp_enqueue_style(
			self::$script_handler,
			plugins_url( 'dist/' . self::$script_handler . '.css', __FILE__ ),
			array( 'wp-edit-blocks' ),
			filemtime( dirname( __FILE__ ) . '/dist/' . self::$script_handler . '.css' )
		);
	}

	/**
	 * Render basic HTML markup.
	 */
	public function render_editor_layout_preview_content() {
		?>
		<div id="editor-large-preview" class="editor-large-preview">
			Loading Editor...
		</div>
		<?php
	}

	/**
	 * Set the plugin settings.
	 *
	 * @return array Settings array.
	 */
	public function get_editor_layout_preview_settings() {
		$settings               = array(
			'disableCustomColors'    => get_theme_support( 'disable-custom-colors' ),
			'disableCustomFontSizes' => get_theme_support( 'disable-custom-font-sizes' ),
			'isRTL'                  => is_rtl(),
		);
		list( $color_palette, ) = (array) get_theme_support( 'editor-color-palette' );
		list( $font_sizes, )    = (array) get_theme_support( 'editor-font-sizes' );
		if ( false !== $color_palette ) {
			$settings['colors'] = $color_palette;
		}
		if ( false !== $font_sizes ) {
			$settings['fontSizes'] = $font_sizes;
		}

		return $settings;
	}

}

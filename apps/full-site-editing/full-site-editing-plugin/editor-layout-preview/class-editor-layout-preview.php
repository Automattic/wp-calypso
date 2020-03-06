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
	private static $script_handler = 'editor-layout-preview-scripts';

	/**
	 * Editor_Layout_Preview constructor.
	 */
	private function __construct() {
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
	private function add_editor_layout_preview_page() {
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
	private function editor_layout_preview_assets( $hook ) {
		// Exit if not the correct page.
		if ( 'settings_page_editor-layout-preview' !== $hook ) {
			return;
		}

		$script_path       = 'dist/editor-layout-preview.js';
		$script_asset_path = dirname( __FILE__ ) . '/dist/editor-layout-preview.asset.php';
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
	}

	/**
	 * Render basic HTML markup.
	 */
	private function render_editor_layout_preview_content() {
		?>
		<div id="editor-large-preview" class="editor-large-preview">
			Loading Editor...
		</div>
		<?php
	}

}

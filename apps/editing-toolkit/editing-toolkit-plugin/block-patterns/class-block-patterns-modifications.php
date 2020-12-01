<?php
/**
 * WPCOM block patterns modifications.
 *
 * Enqueues JS modifications to how block patterns behave within the editor.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Patterns_Modifications
 */
class Block_Patterns_Modifications {
	/**
	 * Class instance.
	 *
	 * @var Block_Patterns_Modifications
	 */
	private static $instance = null;

	/**
	 * Block_Patterns_Modifications constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_and_style' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Block_Patterns_Modifications
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_script_and_style() {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/block-patterns.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'wpcom-block-patterns-modifications',
			plugins_url( 'dist/block-patterns.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_set_script_translations( 'wpcom-block-patterns-modifications', 'full-site-editing' );

		$style_path = 'dist/block-patterns' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'wpcom-block-patterns-modifications',
			plugins_url( $style_path, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . $style_path )
		);
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Block_Patterns_Modifications', 'init' ) );

<?php
/**
 * WPCOM addition to Gutenberg block inspector
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Inspector
 */
class Block_Inspector {
	/**
	 * Class instance.
	 *
	 * @var Block_Inspector
	 */
	private static $instance = null;

	/**
	 * Block_Inspector constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Block_Inspector
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
	public function enqueue_script() {
		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/block-inspector.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		$version             = $asset_file['version'];

		wp_enqueue_script(
			'block-inspector-script',
			plugins_url( 'dist/block-inspector.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : array(),
			$version,
			true
		);

		wp_set_script_translations( 'block-inspector-script', 'full-site-editing' );
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Block_Inspector', 'init' ) );

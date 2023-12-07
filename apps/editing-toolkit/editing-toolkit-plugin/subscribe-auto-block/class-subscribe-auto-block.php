<?php
/**
 * Subscribe auto block file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Subscribe_Auto_Block
 */
class Subscribe_Auto_Block {

	/**
	 * Class instance.
	 *
	 * @var \A8C\FSE\Subscribe_Auto_Block
	 */
	private static $instance = null;	

	/**
	 * Subscribe_Auto_Block constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'register_blocks' ], 100 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_scripts' ], 100 );
		add_action( 'enqueue_block_assets', [ $this, 'enqueue_styles' ], 100 );
	}
	
	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Subscribe_Auto_Block
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Enqueue block editor scripts.
	 */
	public function enqueue_scripts() {
		// if ( ! has_block( 'a8c/subscribe-auto' ) ) {
		// 	return;
		// }

		$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/subscribe-auto-block.asset.php';
		$script_dependencies = $asset_file['dependencies'];
		wp_enqueue_script(
			'a8c-subscribe-auto-block',
			plugins_url( 'dist/subscribe-auto-block.min.js', __FILE__ ),
			is_array( $script_dependencies ) ? $script_dependencies : [],
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/subscribe-auto-block.min.js' ),
			true
		);

		wp_set_script_translations( 'a8c-subscribe-auto-script', 'full-site-editing' );
	}

	/**
	 * Enqueue block styles.
	 */
	public function enqueue_styles() {
		// if ( ! has_block( 'a8c/subscribe-auto' ) ) {
		// 	return;
		// }

		$style_file = is_rtl()
			? 'subscribe-auto-block.rtl.css'
			: 'subscribe-auto-block.css';
		wp_enqueue_style(
			'subscribe-auto-block-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}

	/**
	 * Register block.
	 */
	public function register_blocks() {
		register_block_type(
			'a8c/subscribe-auto',
			[
				'api_version'     => 3,
				'attributes'      => [],
				'render_callback' => [ $this, 'render_a8c_subscribe_auto_block' ]
			]
		);
	}

	/**
	 * Renders subscribe auto block.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content.
	 * @return string
	 */
	public function render_a8c_subscribe_auto_block( $attributes, $content ) {
		$subscribe_block_html = do_blocks( '<!-- wp:jetpack/subscriptions /-->' );
		$subscribe_block_html = 'temp placeholder';
		return "<div style=\"background: yellow; padding 10px; color: black;\">" . $subscribe_block_html . "</div>";
	}

	public static function insert_subscribe_auto_block( $hooked_blocks, $relative_position, $anchor_block, $context ) {
		if ( $context instanceof \WP_Block_Template ) {
			if ( $context->area == 'footer' &&
				$relative_position == 'before' &&
				$anchor_block == 'core/pattern' ) {
				$hooked_blocks[] = 'jetpack/subscribe';
			}
		}
	
		return $hooked_blocks;
	} 
}

add_filter( 'hooked_block_types', [ 'A8C\FSE\Subscribe_Auto_Block', 'insert_subscribe_auto_block' ], 10, 4 );





		// $hooked_blocks[] = 'a8c/subscribe-auto';


				// echo '<pre style="font-size: 10px;">';
				// var_dump( [ 'context' => $context, 'anchor_block' => $anchor_block, 'relative_position' => $relative_position, 'hooked_blocks' => 'a8c/subscribe-auto' ] );
				// echo '</pre>';
				// echo '<hr />';
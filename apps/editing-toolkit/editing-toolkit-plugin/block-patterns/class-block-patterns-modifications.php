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
		use_webpack_assets( 'block-patterns' );
	}
}
add_action( 'init', array( __NAMESPACE__ . '\Block_Patterns_Modifications', 'init' ) );

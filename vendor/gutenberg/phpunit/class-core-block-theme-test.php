<?php
/**
 * Core block theme tests.
 *
 * @package Gutenberg
 */

/**
 * Test inclusion of opt-in core block theme.
 */
class Core_Block_Theme_Test extends WP_UnitTestCase {
	private $old_wp_styles;
	private $old_wp_scripts;

	function setUp() {
		parent::setUp();

		$this->old_wp_scripts = isset( $GLOBALS['wp_scripts'] ) ? $GLOBALS['wp_scripts'] : null;
		remove_action( 'wp_default_scripts', 'wp_default_scripts' );

		$GLOBALS['wp_scripts']                  = new WP_Scripts();
		$GLOBALS['wp_scripts']->default_version = get_bloginfo( 'version' );

		$this->old_wp_styles = isset( $GLOBALS['wp_styles'] ) ? $GLOBALS['wp_styles'] : null;
		remove_action( 'wp_default_styles', 'wp_default_styles' );

		$GLOBALS['wp_styles']                  = new WP_Styles();
		$GLOBALS['wp_styles']->default_version = get_bloginfo( 'version' );
	}

	function tearDown() {
		$GLOBALS['wp_scripts'] = $this->old_wp_scripts;
		add_action( 'wp_default_scripts', 'wp_default_scripts' );

		$GLOBALS['wp_styles'] = $this->old_wp_styles;
		add_action( 'wp_default_styles', 'wp_default_styles' );

		if ( current_theme_supports( 'wp-block-styles' ) ) {
			remove_theme_support( 'wp-block-styles' );
		}

		parent::tearDown();
	}

	/**
	 * Tests that visual block styles are enqueued in the editor even when there is not theme support for 'wp-block-styles'.
	 *
	 * Visual block styles should always be enqueued when editing to avoid the appearance of a broken editor.
	 */
	function test_block_styles_for_editing_without_theme_support() {
		// Confirm we are without theme support by default.
		$this->assertFalse( current_theme_supports( 'wp-block-styles' ) );

		gutenberg_register_scripts_and_styles();

		$this->assertFalse( wp_style_is( 'wp-core-blocks-theme' ) );
		wp_enqueue_style( 'wp-edit-blocks' );
		$this->assertTrue( wp_style_is( 'wp-core-blocks-theme' ) );
	}

	/**
	 * Tests that visual block styles are enqueued when there is theme support for 'wp-block-styles'.
	 *
	 * Visual block styles should always be enqueued when editing to avoid the appearance of a broken editor.
	 */
	function test_block_styles_for_editing_with_theme_support() {
		add_theme_support( 'wp-block-styles' );
		gutenberg_register_scripts_and_styles();

		$this->assertFalse( wp_style_is( 'wp-core-blocks-theme' ) );
		wp_enqueue_style( 'wp-edit-blocks' );
		$this->assertTrue( wp_style_is( 'wp-core-blocks-theme' ) );
	}

	/**
	 * Tests that visual block styles are not enqueued for viewing when there is no theme support for 'wp-block-styles'.
	 *
	 * Visual block styles should not be enqueued unless a theme opts in.
	 * This way we avoid style conflicts with existing themes.
	 */
	function test_no_block_styles_for_viewing_without_theme_support() {
		// Confirm we are without theme support by default.
		$this->assertFalse( current_theme_supports( 'wp-block-styles' ) );

		gutenberg_register_scripts_and_styles();

		$this->assertFalse( wp_style_is( 'wp-core-blocks-theme' ) );
		wp_enqueue_style( 'wp-core-blocks' );
		$this->assertFalse( wp_style_is( 'wp-core-blocks-theme' ) );
	}

	/**
	 * Tests that visual block styles are enqueued for viewing when there is theme support for 'wp-block-styles'.
	 *
	 * Visual block styles should be enqueued when a theme opts in.
	 */
	function test_block_styles_for_viewing_with_theme_support() {
		add_theme_support( 'wp-block-styles' );

		gutenberg_register_scripts_and_styles();

		$this->assertFalse( wp_style_is( 'wp-core-blocks-theme' ) );
		wp_enqueue_style( 'wp-core-blocks' );
		$this->assertTrue( wp_style_is( 'wp-core-blocks-theme' ) );
	}
}

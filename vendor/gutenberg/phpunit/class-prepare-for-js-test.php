<?php
/**
 * Block types registration Tests
 *
 * @package Gutenberg
 */

/**
 * Test gutenberg_prepare_blocks_for_js()
 */
class Prepare_For_JS_Test extends WP_UnitTestCase {

	function tearDown() {
		parent::tearDown();

		$registry = WP_Block_Type_Registry::get_instance();
		$registry->unregister( 'core/dummy' );
	}

	function test_gutenberg_prepare_blocks_for_js() {
		$name     = 'core/dummy';
		$settings = array(
			'icon'            => 'text',
			'render_callback' => 'foo',
		);

		register_block_type( $name, $settings );

		$blocks = gutenberg_prepare_blocks_for_js();

		$this->assertArrayHasKey( $name, $blocks );
		$this->assertSame( array( 'icon' => 'text' ), $blocks[ $name ] );
	}
}

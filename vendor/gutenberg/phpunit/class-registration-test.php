<?php
/**
 * Block types registration Tests
 *
 * @package Gutenberg
 */

/**
 * Test register_block_type(), unregister_block_type(), get_dynamic_block_names()
 */
class Registration_Test extends WP_UnitTestCase {

	function render_stub() {}

	function tearDown() {
		parent::tearDown();

		$registry = WP_Block_Type_Registry::get_instance();

		foreach ( array( 'dummy', 'dynamic' ) as $block_name ) {
			$block_name = 'core/' . $block_name;

			if ( $registry->is_registered( $block_name ) ) {
				$registry->unregister( $block_name );
			}
		}
	}

	function test_register_affects_main_registry() {
		$name     = 'core/dummy';
		$settings = array(
			'icon' => 'text',
		);

		register_block_type( $name, $settings );

		$registry = WP_Block_Type_Registry::get_instance();
		$this->assertTrue( $registry->is_registered( $name ) );
	}

	function test_unregister_affects_main_registry() {
		$name     = 'core/dummy';
		$settings = array(
			'icon' => 'text',
		);

		register_block_type( $name, $settings );
		unregister_block_type( $name );

		$registry = WP_Block_Type_Registry::get_instance();
		$this->assertFalse( $registry->is_registered( $name ) );
	}

	function test_get_dynamic_block_names() {
		register_block_type( 'core/dummy', array() );
		register_block_type( 'core/dynamic', array( 'render_callback' => array( $this, 'render_stub' ) ) );

		$dynamic_block_names = get_dynamic_block_names();

		$this->assertContains( 'core/dynamic', $dynamic_block_names );
		$this->assertNotContains( 'core/dummy', $dynamic_block_names );
	}
}

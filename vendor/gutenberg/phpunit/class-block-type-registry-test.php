<?php
/**
 * WP_Block_Type_Registry Tests
 *
 * @package Gutenberg
 */

/**
 * Tests for WP_Block_Type_Registry
 */
class Block_Type_Registry_Test extends WP_UnitTestCase {

	/**
	 * Dummy block type registry.
	 *
	 * @var WP_Block_Type_Registry
	 */
	private $registry = null;

	function setUp() {
		parent::setUp();

		$this->registry = new WP_Block_Type_Registry();
	}

	function tearDown() {
		parent::tearDown();

		$this->registry = null;
	}

	/**
	 * Should reject numbers
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	function test_invalid_non_string_names() {
		$result = $this->registry->register( 1, array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should reject blocks without a namespace
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	function test_invalid_names_without_namespace() {
		$result = $this->registry->register( 'paragraph', array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should reject blocks with invalid characters
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	function test_invalid_characters() {
		$result = $this->registry->register( 'still/_doing_it_wrong', array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should reject blocks with uppercase characters
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	function test_uppercase_characters() {
		$result = $this->registry->register( 'Core/Paragraph', array() );
		$this->assertFalse( $result );
	}

	/**
	 * Should accept valid block names
	 */
	function test_register_block_type() {
		$name     = 'core/paragraph';
		$settings = array(
			'icon' => 'editor-paragraph',
		);

		$block_type = $this->registry->register( $name, $settings );
		$this->assertEquals( $name, $block_type->name );
		$this->assertEquals( $settings['icon'], $block_type->icon );
		$this->assertEquals( $block_type, $this->registry->get_registered( $name ) );
	}

	/**
	 * Should fail to re-register the same block
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::register
	 */
	function test_register_block_type_twice() {
		$name     = 'core/paragraph';
		$settings = array(
			'icon' => 'editor-paragraph',
		);

		$result = $this->registry->register( $name, $settings );
		$this->assertNotFalse( $result );
		$result = $this->registry->register( $name, $settings );
		$this->assertFalse( $result );
	}

	/**
	 * Should accept a WP_Block_Type instance
	 */
	function test_register_block_type_instance() {
		$block_type = new WP_Dummy_Block_Type( 'core/dummy' );

		$result = $this->registry->register( $block_type );
		$this->assertSame( $block_type, $result );
	}

	/**
	 * Unregistering should fail if a block is not registered
	 *
	 * @expectedIncorrectUsage WP_Block_Type_Registry::unregister
	 */
	function test_unregister_not_registered_block() {
		$result = $this->registry->unregister( 'core/unregistered' );
		$this->assertFalse( $result );
	}

	/**
	 * Should unregister existing blocks
	 */
	function test_unregister_block_type() {
		$name     = 'core/paragraph';
		$settings = array(
			'icon' => 'editor-paragraph',
		);

		$this->registry->register( $name, $settings );
		$block_type = $this->registry->unregister( $name );
		$this->assertEquals( $name, $block_type->name );
		$this->assertEquals( $settings['icon'], $block_type->icon );
		$this->assertFalse( $this->registry->is_registered( $name ) );
	}

	function test_get_all_registered() {
		$names    = array( 'core/paragraph', 'core/image', 'core/blockquote' );
		$settings = array(
			'icon' => 'random',
		);

		foreach ( $names as $name ) {
			$this->registry->register( $name, $settings );
		}

		$registered = $this->registry->get_all_registered();
		$this->assertEqualSets( $names, array_keys( $registered ) );
	}
}

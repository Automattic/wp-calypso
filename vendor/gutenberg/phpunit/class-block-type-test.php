<?php
/**
 * WP_Block_Type Tests
 *
 * @package Gutenberg
 */

/**
 * Tests for WP_Block_Type
 */
class Block_Type_Test extends WP_UnitTestCase {
	function test_set_props() {
		$name = 'core/dummy';
		$args = array(
			'render_callback' => array( $this, 'render_dummy_block' ),
			'foo'             => 'bar',
		);

		$block_type = new WP_Block_Type( $name, $args );

		$this->assertSame( $name, $block_type->name );
		$this->assertSame( $args['render_callback'], $block_type->render_callback );
		$this->assertSame( $args['foo'], $block_type->foo );
	}

	function test_render() {
		$attributes = array(
			'foo' => 'bar',
			'bar' => 'foo',
		);

		$block_type = new WP_Block_Type( 'core/dummy', array(
			'render_callback' => array( $this, 'render_dummy_block' ),
		) );
		$output     = $block_type->render( $attributes );
		$this->assertEquals( $attributes, json_decode( $output, true ) );
	}

	function test_render_for_static_block() {
		$block_type = new WP_Block_Type( 'core/dummy', array() );
		$output     = $block_type->render();

		$this->assertEquals( '', $output );
	}

	function test_is_dynamic_for_static_block() {
		$block_type = new WP_Block_Type( 'core/dummy', array() );

		$this->assertFalse( $block_type->is_dynamic() );
	}

	function test_is_dynamic_for_dynamic_block() {
		$block_type = new WP_Block_Type( 'core/dummy', array(
			'render_callback' => array( $this, 'render_dummy_block' ),
		) );

		$this->assertTrue( $block_type->is_dynamic() );
	}

	function test_prepare_attributes() {
		$attributes = array(
			'correct'            => 'include',
			'wrongType'          => 5,
			'wrongTypeDefaulted' => 5,
			/* missingDefaulted */
			'undefined'          => 'omit',
		);

		$block_type = new WP_Block_Type( 'core/dummy', array(
			'attributes' => array(
				'correct'            => array(
					'type' => 'string',
				),
				'wrongType'          => array(
					'type' => 'string',
				),
				'wrongTypeDefaulted' => array(
					'type'    => 'string',
					'default' => 'defaulted',
				),
				'missingDefaulted'   => array(
					'type'    => 'string',
					'default' => 'define',
				),
			),
		) );

		$prepared_attributes = $block_type->prepare_attributes_for_render( $attributes );

		$this->assertEquals( array(
			'correct'            => 'include',
			'wrongType'          => null,
			'wrongTypeDefaulted' => 'defaulted',
			'missingDefaulted'   => 'define',
		), $prepared_attributes );
	}

	function render_dummy_block( $attributes ) {
		return json_encode( $attributes );
	}

	function render_dummy_block_with_content( $attributes, $content ) {
		$attributes['_content'] = $content;

		return json_encode( $attributes );
	}
}

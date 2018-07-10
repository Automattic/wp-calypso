<?php
/**
 * WP_Dummy_Block_Type for testing
 *
 * @package Gutenberg
 */

/**
 * Test class extending WP_Block_Type
 */
class WP_Dummy_Block_Type extends WP_Block_Type {

	public function render( $attributes = array(), $content = '' ) {
		return '<div>' . $content . '</div>';
	}
}

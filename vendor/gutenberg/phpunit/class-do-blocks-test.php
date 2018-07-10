<?php
/**
 * `do_blocks` rendering test
 *
 * @package Gutenberg
 */

/**
 * Test do_blocks
 */
class Do_Blocks_Test extends WP_UnitTestCase {
	/**
	 * Test do_blocks removes comment demarcations.
	 *
	 * @covers ::do_blocks
	 */
	function test_do_blocks_removes_comments() {
		$original_html = file_get_contents( dirname( __FILE__ ) . '/fixtures/do-blocks-original.html' );
		$expected_html = file_get_contents( dirname( __FILE__ ) . '/fixtures/do-blocks-expected.html' );

		$actual_html = do_blocks( $original_html );

		$this->assertEquals( $expected_html, $actual_html );
	}
}

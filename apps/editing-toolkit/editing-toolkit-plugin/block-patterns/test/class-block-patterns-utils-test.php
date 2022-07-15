<?php
/**
 * Block patterns Utils tests
 * Run:
 * cd apps/editing-toolkit
 * yarn run test:php --testsuite block-patterns
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../class-block-patterns-utils.php';

/**
 * Class Coming_Soon_Test
 */
class Block_Patterns_Utils_Test extends TestCase {
	/**
	 * Block_Patterns_Utils
	 *
	 * @var object
	 */
	protected $utils;

	/**
	 * Pre-test setup.
	 */
	public function set_up() {
		parent::set_up();
		$this->utils = new Block_Patterns_Utils();
	}

	/**
	 *  Tests that we receive an empty block_types array where there are no block types in pattern_meta
	 */
	public function test_should_return_empty_array_from_block_types_check() {
		$test_pattern = $this->get_test_pattern();
		$block_types  = $this->utils->maybe_get_pattern_block_types_from_pattern_meta( $test_pattern );

		$this->assertEmpty( $block_types );
	}

	/**
	 *  Tests that we can parse block types from pattern_meta.
	 */
	public function test_should_return_block_types_from_patterns_meta() {
		$test_pattern = $this->get_test_pattern(
			array(
				'pattern_meta' => array(
					'block_type_core/template-part/footer' => true,
				),
			)
		);
		$block_types  = $this->utils->maybe_get_pattern_block_types_from_pattern_meta( $test_pattern );

		$this->assertEquals( array( 'core/template-part/footer' ), $block_types );
	}

	/**
	 * Util function from grabbing a test pattern.
	 *
	 * @param  array $new_pattern_values Values to merge into the default array.
	 * @return array                     A test pattern.
	 */
	private function get_test_pattern( $new_pattern_values = array() ) {
		$default_pattern = array(
			'ID'            => '1',
			'site_id'       => '2',
			'title'         => 'test title',
			'name'          => 'test pattern name',
			'description'   => 'test description',
			'html'          => '<p>test</p>',
			'source_url'    => 'http;//test',
			'modified_date' => 'dd:mm:YY',
			'categories'    => array(
				array(
					'title' => 'test-category',
				),
			),
			'pattern_meta'  => array(
				'is_web' => true,
			),
		);

		return array_merge( $default_pattern, $new_pattern_values );
	}
}

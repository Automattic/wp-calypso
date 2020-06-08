<?php
/**
 * Is FSE Active Tests File
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

/**
 * Class Is_FSE_Active_Test
 */
class Is_FSE_Active_Test extends TestCase {
	/**
	 * Tests that the is fse active function exists.
	 */
	public function testFunctionExists() {
		$does_exist = function_exists( '\A8C\FSE\is_full_site_editing_active' );
		$this->assertTrue( $does_exist );
	}
}

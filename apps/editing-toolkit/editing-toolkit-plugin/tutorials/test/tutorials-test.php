<?php
// phpcs:ignoreFile

use PHPUnit\Framework\TestCase;

require_once dirname( __FILE__, 2 ) . '/tutorials.php';

class WPCom_Tutorials_Test extends TestCase {

	public function tearDown() {
		// cleanse after each test
		foreach ( wpcom_get_all_tutorials() as $id ) {
			wpcom_tutorials()->unregister( $id );
		}
		// delete status storage
		delete_option( WPCom_Tutorials::OPTION_NAME );
	}

	public function test_registered_tutorial_is_returned() {
		wpcom_register_tutorial(
			'foo',
			array(
				'title' => 'Foo',
				'tasks' => $this->get_tasks(),
			)
		);

		$return_tutorial = wpcom_get_tutorial( 'foo' );

		$expected_tutorial = array(
			'id'    => 'foo',
			'title' => 'Foo',
			'tasks' => $this->get_tasks_with_status(),
		);

		$this->assertEquals( $return_tutorial, $expected_tutorial );
	}

	public function test_all_registered_ids_are_returned() {
		$this->assertEquals( wpcom_get_all_tutorials(), array() );

		wpcom_register_tutorial(
			'foo',
			array(
				'title' => 'Foo',
				'tasks' => $this->get_tasks(),
			)
		);
		wpcom_register_tutorial(
			'bar',
			array(
				'title' => 'Bar',
				'tasks' => $this->get_tasks(),
			)
		);
		wpcom_register_tutorial(
			'baz',
			array(
				'title' => 'Baz',
				'tasks' => $this->get_tasks(),
			)
		);

		$this->assertEquals( wpcom_get_all_tutorials(), array( 'foo', 'bar', 'baz' ) );
	}

	public function test_tutorial_with_malformed_options_fails() {
		// empty option object
		$foo1 = wpcom_register_tutorial( 'foo', array() );
		$this->assertEmpty( wpcom_get_all_tutorials() );
		$this->assertFalse( $foo1 );

		// no title
		$foo2 = wpcom_register_tutorial( 'foo', array( 'tasks' => $this->get_tasks() ) );
		$this->assertEmpty( wpcom_get_all_tutorials() );
		$this->assertFalse( $foo2 );

		// no steps
		$foo3 = wpcom_register_tutorial( 'foo', array( 'title' => 'Foo' ) );
		$this->assertEmpty( wpcom_get_all_tutorials() );
		$this->assertFalse( $foo3 );

		// empty steps
		$foo4 = wpcom_register_tutorial(
			'foo',
			array(
				'title' => 'Foo',
				'steps' => array(),
			)
		);
		$this->assertEmpty( wpcom_get_all_tutorials() );
		$this->assertFalse( $foo4 );
	}

	// boilerplace
	private function get_tasks() {
		return array(
			array(
				'id'    => 'bar',
				'title' => 'Bar',
			),
		);
	}

	private function get_tasks_with_status( $status = 'pending' ) {
		$tasks = $this->get_tasks();
		foreach ( $tasks as $i => $task ) {
			$tasks[ $i ]['status'] = $status;
		}
		return $tasks;
	}
}

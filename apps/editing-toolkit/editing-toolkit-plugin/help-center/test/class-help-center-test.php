<?php
/**
 * Help Center test file
 *
 * @package full-site-editing-plugin
 */

use A8C\FSE\Help_Center;

require_once __DIR__ . '/../class-help-center.php';

/**
 * Class WPCOM_Help_Center_Test
 */
class WPCOM_Help_Center_Test extends WP_UnitTestCase {
	/**
	 * Partial mock of the help center class
	 *
	 * @var class
	 */
	private $help_center;

	/**
	 * Pre-test setup.
	 */
	public function setUp() {
		parent::setUp();

		$this->help_center = $this->createPartialMock(
			Help_Center::class,
			array(
				'enqueue_script',
				'is_support_site',
				'is_admin_bar',
				'is_site_editor',
				'is_block_editor',
			)
		);
	}

	/**
	 * Test that for users the script is not enqueued.
	 */
	public function test_non_admin() {
		$user_id = self::factory()->user->create(
			array(
				'role' => 'user',
			)
		);
		wp_set_current_user( $user_id );
		$this->help_center->expects( $this->never() )->method( 'enqueue_script' );
		$this->help_center->enqueue_wp_admin_scripts();
	}

	/**
	 * Test that for admin only the script is not enqueued.
	 */
	public function test_admin() {
		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $user_id );

		$this->help_center->enqueue_wp_admin_scripts();
		$this->help_center->expects( $this->never() )->method( 'enqueue_script' );
	}

	/**
	 * Test that for admin user in the site editor, that the script is not enqueued.
	 */
	public function test_admin_in_site_editor() {
		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $user_id );

		$this->help_center->method( 'is_site_editor' )->willReturn( true );

		$this->help_center->enqueue_wp_admin_scripts();
		$this->help_center->expects( $this->never() )->method( 'enqueue_script' );
	}

	/**
	 * Test that for admin user in the block editor, that the script is not enqueued.
	 */
	public function test_admin_in_block_editor() {
		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $user_id );

		$this->help_center->method( 'is_block_editor' )->willReturn( true );

		$this->help_center->enqueue_wp_admin_scripts();
		$this->help_center->expects( $this->never() )->method( 'enqueue_script' );
	}

	/**
	 * Test that for admin user at the support site that the script is not enqueued.
	 */
	public function test_admin_support_site() {

		$this->help_center->method( 'is_support_site' )->willReturn( true );
		$this->help_center->method( 'is_admin_bar' )->willReturn( true );

		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $user_id );

		$this->help_center->expects( $this->once() )->method( 'enqueue_script' );
		$this->help_center->enqueue_wp_admin_scripts();

	}
}

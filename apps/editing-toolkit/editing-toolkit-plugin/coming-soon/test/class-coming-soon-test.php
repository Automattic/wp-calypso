<?php
/**
 * Coming Soon Tests File
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE\Coming_soon;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../coming-soon.php';

/**
 * Class Is_FSE_Active_Test
 */
class Coming_Soon_Test extends TestCase {
	/**
	 * Pre-test suite set up.
	 */
	public static function setUpBeforeClass() {
		parent::setUpBeforeClass();
		apply_filters( 'a8c_enable_public_coming_soon', '__return_true' );
	}

	/**
	 * Post-test uite actions.
	 */
	public static function tearDownAfterClass() {
		self::delete_coming_soon_site_options();
		parent::tearDownAfterClass();
	}

	/**
	 * Add coming soon options.
	 */
	private static function set_site_as_coming_soon() {
		self::delete_coming_soon_site_options();
		add_option( 'blog_public', 0 );
		add_option( 'wpcom_public_coming_soon', 1 );
	}

	/**
	 * Remove coming soon options.
	 */
	private static function delete_coming_soon_site_options() {
		delete_option( 'blog_public' );
		delete_option( 'wpcom_public_coming_soon' );
	}

	/**
	 * Tests that we update the coming soon option when the public option moves
	 * from public not indexed to anything.
	 */
	public function test_disable_coming_soon_on_privacy_change() {
		self::set_site_as_coming_soon();

		// Should deactivate Coming Soon when moving from public not indexed to public indexed (launch).
		$result = disable_coming_soon_on_privacy_change( 0, 1 );
		$this->assertTrue( $result );
		$this->assertEquals( 0, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should deactivate Coming Soon when moving from public not indexed to private.
		$result = disable_coming_soon_on_privacy_change( 0, -1 );
		$this->assertTrue( $result );
		$this->assertEquals( 0, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should not deactivate when moving from public indexed to public not indexed.
		$result = disable_coming_soon_on_privacy_change( 1, 0 );
		$this->assertFalse( $result );
		$this->assertEquals( 1, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should not deactivate when moving from private to public.
		$result = disable_coming_soon_on_privacy_change( -1, 1 );
		$this->assertFalse( $result );
		$this->assertEquals( 1, get_option( 'wpcom_public_coming_soon' ) );
	}

	/**
	 * Tests that we add the unfiltered option to the return value.
	 */
	public function test_add_public_coming_soon_to_settings_endpoint_post() {
		$input  = array();
		$result = add_public_coming_soon_to_settings_endpoint_post( $input, array() );

		$this->assertEquals( $input, $result );

		$unfiltered_input = array( 'wpcom_public_coming_soon' => '111111' );
		$result           = add_public_coming_soon_to_settings_endpoint_post( $input, $unfiltered_input );

		$this->assertEquals( 111111, $result['wpcom_public_coming_soon'] );
	}

	/**
	 * Tests that we add the coming soon option to the return value.
	 */
	public function test_add_public_coming_soon_to_settings_endpoint_get() {
		self::delete_coming_soon_site_options();
		$options = array();
		$result  = add_public_coming_soon_to_settings_endpoint_get( $options );
		$this->assertEquals( 0, $result['wpcom_public_coming_soon'] );

		// Now set the coming soon option to `1`.
		self::set_site_as_coming_soon();
		$result = add_public_coming_soon_to_settings_endpoint_get( $options );

		$this->assertEquals( 1, $result['wpcom_public_coming_soon'] );
	}

	/**
	 * Tests that we're adding the right option value on site creation
	 * when the coming soon option is added to the meta.
	 */
	public function test_add_option_to_new_site_with_coming_soon_meta() {
		self::delete_coming_soon_site_options();

		$meta = array(
			'public'  => 0,
			'options' => array( 'wpcom_public_coming_soon' => 1 ),
		);

		// Check that the function updates the option and returns `true`.
		$result = add_option_to_new_site( get_current_blog_id(), null, null, null, null, $meta );

		$this->assertTrue( $result );
		$this->assertEquals( 1, get_option( 'wpcom_public_coming_soon' ) );

		// Check that we've added the action correctly.
		self::delete_coming_soon_site_options();
		$this->assertEquals( 0, get_option( 'wpcom_public_coming_soon' ) );
		do_action( 'wpmu_new_blog', get_current_blog_id(), null, null, null, null, $meta );
		$this->assertEquals( 1, get_option( 'wpcom_public_coming_soon' ) );
	}

	/**
	 * Tests that we're adding the right option value on site creation
	 * when the coming soon option is not available in the meta.
	 */
	public function test_add_option_to_new_site_without_coming_soon_meta() {
		self::delete_coming_soon_site_options();

		$meta = array(
			'public'  => 0,
			'options' => array(),
		);

		// Check that the function updates the option and returns `true`.
		$result = add_option_to_new_site( get_current_blog_id(), null, null, null, null, $meta );

		$this->assertFalse( $result );
		$this->assertEquals( 0, get_option( 'wpcom_public_coming_soon' ) );

		// Check that we've added the action correctly.
		self::delete_coming_soon_site_options();

		do_action( 'wpmu_new_blog', get_current_blog_id(), null, null, null, null, $meta );
		$this->assertEquals( 0, get_option( 'wpcom_public_coming_soon' ) );
	}
}

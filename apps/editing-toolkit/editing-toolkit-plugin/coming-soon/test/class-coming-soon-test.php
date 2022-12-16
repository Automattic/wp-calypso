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
 * Class Coming_Soon_Test
 */
class Coming_Soon_Test extends TestCase {
	/**
	 * Preview links used to test bypassing Coming Soon using the URL with share code provided as GET parameter.
	 *
	 * @var \string[][]
	 */
	private static $preview_links = array(
		array(
			'code'       => 'sharing-code',
			'created_at' => '2022-11-23',
		),
	);

	/**
	 * Post-test suite actions.
	 */
	public static function tearDownAfterClass() {
		self::delete_coming_soon_site_options();
		parent::tearDownAfterClass();
	}

	/**
	 * Post-test actions.
	 */
	public function tearDown() {
		self::delete_preview_links_parameters();
		parent::tearDown();
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
	 * Mock valid share code GET request
	 */
	private static function set_valid_share_code_get_parameter() {
		$_GET['share'] = self::$preview_links[0]['code'];
	}

	/**
	 * Mock valid share code COOKIE request
	 */
	private static function set_valid_share_code_cookie_parameter() {
		$_COOKIE['wp_share_code'] = self::$preview_links[0]['code'];
	}

	/**
	 * Remove share code from GET and COOKIE.
	 */
	private static function delete_preview_links_parameters() {
		unset( $_GET['share'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		unset( $_COOKIE['wp_share_code'] );
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
		$this->assertSame( 0, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should deactivate Coming Soon when moving from public not indexed to private.
		$result = disable_coming_soon_on_privacy_change( 0, -1 );
		$this->assertTrue( $result );
		$this->assertSame( 0, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should not deactivate when moving from public indexed to public not indexed.
		$result = disable_coming_soon_on_privacy_change( 1, 0 );
		$this->assertFalse( $result );
		$this->assertSame( 1, get_option( 'wpcom_public_coming_soon' ) );

		self::set_site_as_coming_soon();

		// Should not deactivate when moving from private to public.
		$result = disable_coming_soon_on_privacy_change( -1, 1 );
		$this->assertFalse( $result );
		$this->assertSame( 1, get_option( 'wpcom_public_coming_soon' ) );
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
		$this->assertSame( 0, $result['wpcom_public_coming_soon'] );

		// Now set the coming soon option to `1`.
		self::set_site_as_coming_soon();
		$result = add_public_coming_soon_to_settings_endpoint_get( $options );

		$this->assertSame( 1, $result['wpcom_public_coming_soon'] );
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
		$this->assertSame( 1, get_option( 'wpcom_public_coming_soon' ) );

		// Check that we've added the action correctly.
		self::delete_coming_soon_site_options();
		$this->assertFalse( get_option( 'wpcom_public_coming_soon' ) );
		do_action( 'wpmu_new_blog', get_current_blog_id(), null, null, null, null, $meta );
		$this->assertSame( 1, get_option( 'wpcom_public_coming_soon' ) );
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
		$this->assertFalse( get_option( 'wpcom_public_coming_soon' ) );

		// Check that we've added the action correctly.
		self::delete_coming_soon_site_options();

		do_action( 'wpmu_new_blog', get_current_blog_id(), null, null, null, null, $meta );
		$this->assertFalse( get_option( 'wpcom_public_coming_soon' ) );
	}

	/**
	 * Tests that is_accessed_by_valid_share_link() returns true for requests
	 * that include valid preview link.
	 *
	 * @return void
	 */
	public function test_is_accessed_by_valid_share_link_success() {
		update_option( 'wpcom_public_preview_links', self::$preview_links );

		$result = is_accessed_by_valid_share_link( self::$preview_links[0]['code'] );

		$this->assertTrue( $result );
	}

	/**
	 * Tests that is_accessed_by_valid_share_link() returns false for requests
	 * that include invalid preview link.
	 *
	 * @return void
	 */
	public function test_is_accessed_by_valid_share_link_failure() {
		update_option( 'wpcom_public_preview_links', self::$preview_links );

		$result = is_accessed_by_valid_share_link( 'foo-bar' );

		$this->assertFalse( $result );
	}

	/**
	 * Tests if get_share_code() return share code from GET param.
	 *
	 * @return void
	 */
	public function test_get_share_code_gets_code_from_get() {
		self::set_valid_share_code_get_parameter();

		$share_code = get_share_code();

		$this->assertEquals( 'sharing-code', $share_code );
	}

	/**
	 * Tests if get_share_code() return share code from COOKIE param.
	 *
	 * @return void
	 */
	public function test_get_share_code_gets_code_from_cookie() {
		self::set_valid_share_code_cookie_parameter();

		$share_code = get_share_code();

		$this->assertEquals( 'sharing-code', $share_code );
	}

	/**
	 * Tests if get_share_code() return empty share code if it's not set as GET or COOKIE parameter.
	 *
	 * @return void
	 */
	public function test_get_share_code_gets_empty_code_if_not_set() {
		$share_code = get_share_code();

		$this->assertSame( '', $share_code );
	}
}

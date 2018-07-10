<?php
/**
 * Admin Tests
 *
 * @package Gutenberg
 */

/**
 * Test functions in register.php
 */
class Admin_Test extends WP_UnitTestCase {

	/**
	 * Editor user ID.
	 *
	 * @var int
	 */
	protected static $editor_user_id;

	/**
	 * ID for a post containing blocks.
	 *
	 * @var int
	 */
	protected static $post_with_blocks;

	/**
	 * ID for a post without blocks.
	 *
	 * @var int
	 */
	protected static $post_without_blocks;

	/**
	 * Set up before class.
	 */
	public static function wpSetUpBeforeClass() {
		self::$editor_user_id      = self::factory()->user->create( array(
			'role' => 'editor',
		) );
		self::$post_with_blocks    = self::factory()->post->create( array(
			'post_title'   => 'Example',
			'post_content' => "<!-- wp:core/text {\"dropCap\":true} -->\n<p class=\"has-drop-cap\">Tester</p>\n<!-- /wp:core/text -->",
		) );
		self::$post_without_blocks = self::factory()->post->create( array(
			'post_title'   => 'Example',
			'post_content' => 'Tester',
		) );
	}

	/**
	 * Tests gutenberg_can_edit_post().
	 *
	 * @covers ::gutenberg_can_edit_post
	 */
	function test_gutenberg_can_edit_post() {
		$this->assertFalse( gutenberg_can_edit_post( -1 ) );
		$bogus_post_id = $this->factory()->post->create( array(
			'post_type' => 'bogus',
		) );
		$this->assertFalse( gutenberg_can_edit_post( $bogus_post_id ) );

		register_post_type( 'restless', array(
			'show_in_rest' => false,
		) );
		$restless_post_id = $this->factory()->post->create( array(
			'post_type' => 'restless',
		) );
		$this->assertFalse( gutenberg_can_edit_post( $restless_post_id ) );

		$generic_post_id = $this->factory()->post->create();

		wp_set_current_user( 0 );
		$this->assertFalse( gutenberg_can_edit_post( $generic_post_id ) );

		wp_set_current_user( self::$editor_user_id );
		$this->assertTrue( gutenberg_can_edit_post( $generic_post_id ) );
	}

	/**
	 * Tests gutenberg_post_has_blocks().
	 *
	 * @covers ::gutenberg_post_has_blocks
	 */
	function test_gutenberg_post_has_blocks() {
		$this->assertTrue( gutenberg_post_has_blocks( self::$post_with_blocks ) );
		$this->assertFalse( gutenberg_post_has_blocks( self::$post_without_blocks ) );
	}

	/**
	 * Tests gutenberg_content_has_blocks().
	 *
	 * @covers ::gutenberg_content_has_blocks
	 */
	function test_gutenberg_content_has_blocks() {
		$content_with_blocks    = get_post_field( 'post_content', self::$post_with_blocks );
		$content_without_blocks = get_post_field( 'post_content', self::$post_without_blocks );

		$this->assertTrue( gutenberg_content_has_blocks( $content_with_blocks ) );
		$this->assertFalse( gutenberg_content_has_blocks( $content_without_blocks ) );
	}

	/**
	 * Tests gutenberg_add_gutenberg_post_state().
	 *
	 * @covers ::gutenberg_add_gutenberg_post_state
	 */
	function test_add_gutenberg_post_state() {
		// With blocks.
		$post_states = apply_filters( 'display_post_states', array(), get_post( self::$post_with_blocks ) );
		$this->assertEquals( array( 'Gutenberg' ), $post_states );

		// Without blocks.
		$post_states = apply_filters( 'display_post_states', array(), get_post( self::$post_without_blocks ) );
		$this->assertEquals( array(), $post_states );
	}

	/**
	 * Test that the revisions 'return to editor' links are set correctly for Classic & Gutenberg editors.
	 *
	 * @covers ::gutenberg_revisions_link_to_editor
	 */
	function test_gutenberg_revisions_link_to_editor() {
		global $pagenow;

		// Set up $pagenow so the filter will work.
		$pagenow = 'revision.php';

		// Test the filter when Gutenberg is the active editor.
		$_REQUEST['gutenberg'] = '1';
		$link                  = apply_filters( 'get_edit_post_link', 'http://test.com' );
		$this->assertEquals( 'http://test.com', $link );

		// Test the filter when Gutenberg is not the active editor.
		unset( $_REQUEST['gutenberg'] );
		$link = apply_filters( 'get_edit_post_link', 'http://test.com' );
		$this->assertEquals( 'http://test.com?classic-editor', $link );
	}

	/**
	 * Test that the revisions 'restore this revision' button links correctly for Classic & Gutenberg editors.
	 */
	function test_gutenberg_revisions_restore() {
		// Test the filter when Gutenberg is the active editor.
		$_REQUEST['gutenberg'] = '1';
		$link                  = apply_filters( 'wp_prepare_revision_for_js', array( 'restoreUrl' => 'http://test.com' ) );
		$this->assertEquals( array( 'restoreUrl' => 'http://test.com?gutenberg=1' ), $link );

		// Test the filter when Gutenberg is not the active editor.
		unset( $_REQUEST['gutenberg'] );
		$link = apply_filters( 'wp_prepare_revision_for_js', array( 'restoreUrl' => 'http://test.com' ) );
		$this->assertEquals( array( 'restoreUrl' => 'http://test.com' ), $link );
	}

	/**
	 * Ensure gutenberg_preload_api_request() works without notices in PHP 5.2.
	 *
	 * The array_reduce() function only accepts mixed variables starting with PHP 5.3.
	 */
	function test_preload_api_request_no_notices_php_52() {
		$this->assertTrue( is_array( gutenberg_preload_api_request( 0, '/' ) ) );
	}
}

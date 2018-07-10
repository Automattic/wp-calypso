<?php
/**
 * Shared block rendering tests.
 *
 * @package Gutenberg
 */

/**
 * Tests shared block rendering.
 */
class Shared_Blocks_Render_Test extends WP_UnitTestCase {
	/**
	 * Fake user ID.
	 *
	 * @var int
	 */
	protected static $user_id;

	/**
	 * Fake block ID.
	 *
	 * @var int
	 */
	protected static $block_id;

	/**
	 * Fake post ID.
	 *
	 * @var int
	 */
	protected static $post_id;

	/**
	 * Create fake data before tests run.
	 *
	 * @param WP_UnitTest_Factory $factory Helper that creates fake data.
	 */
	public static function wpSetUpBeforeClass( $factory ) {
		self::$user_id = $factory->user->create( array(
			'role' => 'editor',
		) );

		self::$post_id = $factory->post->create( array(
			'post_author'  => self::$user_id,
			'post_type'    => 'post',
			'post_status'  => 'publish',
			'post_title'   => 'Test Post',
			'post_content' => '<p>Hello world!</p>',
		) );

		self::$block_id = $factory->post->create( array(
			'post_author'  => self::$user_id,
			'post_type'    => 'wp_block',
			'post_status'  => 'publish',
			'post_title'   => 'Test Block',
			'post_content' => '<!-- wp:core/paragraph --><p>Hello world!</p><!-- /wp:core/paragraph -->',
		) );
	}

	/**
	 * Delete fake data after tests run.
	 */
	public static function wpTearDownAfterClass() {
		wp_delete_post( self::$block_id, true );
		wp_delete_post( self::$post_id, true );
		self::delete_user( self::$user_id );
	}

	/**
	 * Test rendering of a shared block.
	 */
	public function test_render() {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'core/block' );
		$output     = $block_type->render( array( 'ref' => self::$block_id ) );
		$this->assertSame( '<p>Hello world!</p>', $output );
	}

	/**
	 * Test rendering of a shared block when 'ref' is missing, which should fail by
	 * rendering an empty string.
	 */
	public function test_ref_empty() {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'core/block' );
		$output     = $block_type->render( array() );
		$this->assertSame( '', $output );
	}

	/**
	 * Test rendering of a shared block when 'ref' points to wrong post type, which
	 * should fail by rendering an empty string.
	 */
	public function test_ref_wrong_post_type() {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'core/block' );
		$output     = $block_type->render( array( 'ref' => self::$post_id ) );
		$this->assertSame( '', $output );
	}
}

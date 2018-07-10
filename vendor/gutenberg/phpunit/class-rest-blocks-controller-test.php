<?php
/**
 * WP_REST_Blocks_Controller tests
 *
 * @package gutenberg
 */

/**
 * Tests for WP_REST_Blocks_Controller.
 */
class REST_Blocks_Controller_Test extends WP_Test_REST_Controller_Testcase {

	/**
	 * Our fake block's post ID.
	 *
	 * @var int
	 */
	protected static $post_id;

	/**
	 * Our fake user's ID.
	 *
	 * @var int
	 */
	protected static $user_id;

	/**
	 * Create fake data before our tests run.
	 *
	 * @param WP_UnitTest_Factory $factory Helper that lets us create fake data.
	 */
	public static function wpSetUpBeforeClass( $factory ) {
		self::$post_id = wp_insert_post(
			array(
				'post_type'    => 'wp_block',
				'post_status'  => 'publish',
				'post_title'   => 'My cool block',
				'post_content' => '<!-- wp:core/paragraph --><p>Hello!</p><!-- /wp:core/paragraph -->',
			)
		);

		self::$user_id = $factory->user->create(
			array(
				'role' => 'editor',
			)
		);
	}

	/**
	 * Delete our fake data after our tests run.
	 */
	public static function wpTearDownAfterClass() {
		wp_delete_post( self::$post_id );

		self::delete_user( self::$user_id );
	}

	/**
	 * Check that our routes get set up properly.
	 */
	public function test_register_routes() {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( '/wp/v2/blocks', $routes );
		$this->assertCount( 2, $routes['/wp/v2/blocks'] );
		$this->assertArrayHasKey( '/wp/v2/blocks/(?P<id>[\d]+)', $routes );
		$this->assertCount( 3, $routes['/wp/v2/blocks/(?P<id>[\d]+)'] );
	}

	/**
	 * Check that we can GET a collection of blocks.
	 */
	public function test_get_items() {
		wp_set_current_user( self::$user_id );

		$request  = new WP_REST_Request( 'GET', '/wp/v2/blocks' );
		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals(
			array(
				array(
					'id'      => self::$post_id,
					'title'   => 'My cool block',
					'content' => '<!-- wp:core/paragraph --><p>Hello!</p><!-- /wp:core/paragraph -->',
				),
			), $response->get_data()
		);
	}

	/**
	 * Check that we can GET a single block.
	 */
	public function test_get_item() {
		wp_set_current_user( self::$user_id );

		$request  = new WP_REST_Request( 'GET', '/wp/v2/blocks/' . self::$post_id );
		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals(
			array(
				'id'      => self::$post_id,
				'title'   => 'My cool block',
				'content' => '<!-- wp:core/paragraph --><p>Hello!</p><!-- /wp:core/paragraph -->',
			), $response->get_data()
		);
	}

	/**
	 * Check that we can POST to create a new block.
	 */
	public function test_create_item() {
		wp_set_current_user( self::$user_id );

		$request = new WP_REST_Request( 'POST', '/wp/v2/blocks/' . self::$post_id );
		$request->set_body_params(
			array(
				'title'   => 'New cool block',
				'content' => '<!-- wp:core/paragraph --><p>Wow!</p><!-- /wp:core/paragraph -->',
			)
		);

		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'content', $data );

		$this->assertEquals( self::$post_id, $data['id'] );
		$this->assertEquals( 'New cool block', $data['title'] );
		$this->assertEquals( '<!-- wp:core/paragraph --><p>Wow!</p><!-- /wp:core/paragraph -->', $data['content'] );
	}

	/**
	 * Check that we can PUT to update a block.
	 */
	public function test_update_item() {
		wp_set_current_user( self::$user_id );

		$request = new WP_REST_Request( 'PUT', '/wp/v2/blocks/' . self::$post_id );
		$request->set_body_params(
			array(
				'title'   => 'Updated cool block',
				'content' => '<!-- wp:core/paragraph --><p>Nice!</p><!-- /wp:core/paragraph -->',
			)
		);

		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertArrayHasKey( 'id', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'content', $data );

		$this->assertEquals( self::$post_id, $data['id'] );
		$this->assertEquals( 'Updated cool block', $data['title'] );
		$this->assertEquals( '<!-- wp:core/paragraph --><p>Nice!</p><!-- /wp:core/paragraph -->', $data['content'] );
	}

	/**
	 * Check that we can DELETE a block.
	 */
	public function test_delete_item() {
		wp_set_current_user( self::$user_id );

		$request = new WP_REST_Request( 'DELETE', '/wp/v2/blocks/' . self::$post_id );

		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertArrayHasKey( 'deleted', $data );
		$this->assertArrayHasKey( 'previous', $data );

		$this->assertTrue( $data['deleted'] );

		$this->assertArrayHasKey( 'id', $data['previous'] );
		$this->assertArrayHasKey( 'title', $data['previous'] );
		$this->assertArrayHasKey( 'content', $data['previous'] );

		$this->assertEquals( self::$post_id, $data['previous']['id'] );
		$this->assertEquals( 'My cool block', $data['previous']['title'] );
		$this->assertEquals( '<!-- wp:core/paragraph --><p>Hello!</p><!-- /wp:core/paragraph -->', $data['previous']['content'] );
	}

	/**
	 * Check that we have defined a JSON schema.
	 */
	public function test_get_item_schema() {
		$request    = new WP_REST_Request( 'OPTIONS', '/wp/v2/blocks' );
		$response   = rest_get_server()->dispatch( $request );
		$data       = $response->get_data();
		$properties = $data['schema']['properties'];

		$this->assertEquals( 3, count( $properties ) );
		$this->assertArrayHasKey( 'id', $properties );
		$this->assertArrayHasKey( 'title', $properties );
		$this->assertArrayHasKey( 'content', $properties );
	}

	/**
	 * Test cases for test_capabilities().
	 */
	public function data_capabilities() {
		return array(
			array( 'create', 'editor', 201 ),
			array( 'create', 'author', 201 ),
			array( 'create', 'contributor', 403 ),
			array( 'create', null, 401 ),

			array( 'read', 'editor', 200 ),
			array( 'read', 'author', 200 ),
			array( 'read', 'contributor', 200 ),
			array( 'read', null, 401 ),

			array( 'update_delete_own', 'editor', 200 ),
			array( 'update_delete_own', 'author', 200 ),
			array( 'update_delete_own', 'contributor', 403 ),

			array( 'update_delete_others', 'editor', 200 ),
			array( 'update_delete_others', 'author', 403 ),
			array( 'update_delete_others', 'contributor', 403 ),
			array( 'update_delete_others', null, 401 ),
		);
	}

	/**
	 * Exhaustively check that each role either can or cannot create, edit,
	 * update, and delete shared blocks.
	 *
	 * @dataProvider data_capabilities
	 */
	public function test_capabilities( $action, $role, $expected_status ) {
		if ( $role ) {
			$user_id = $this->factory->user->create( array( 'role' => $role ) );
			wp_set_current_user( $user_id );
		} else {
			wp_set_current_user( 0 );
		}

		switch ( $action ) {
			case 'create':
				$request = new WP_REST_Request( 'POST', '/wp/v2/blocks' );
				$request->set_body_params(
					array(
						'title'   => 'Test',
						'content' => '<!-- wp:core/paragraph --><p>Test</p><!-- /wp:core/paragraph -->',
					)
				);

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				break;

			case 'read':
				$request = new WP_REST_Request( 'GET', '/wp/v2/blocks/' . self::$post_id );

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				break;

			case 'update_delete_own':
				$post_id = wp_insert_post(
					array(
						'post_type'    => 'wp_block',
						'post_status'  => 'publish',
						'post_title'   => 'My cool block',
						'post_content' => '<!-- wp:core/paragraph --><p>Hello!</p><!-- /wp:core/paragraph -->',
						'post_author'  => $user_id,
					)
				);

				$request = new WP_REST_Request( 'PUT', '/wp/v2/blocks/' . $post_id );
				$request->set_body_params(
					array(
						'title'   => 'Test',
						'content' => '<!-- wp:core/paragraph --><p>Test</p><!-- /wp:core/paragraph -->',
					)
				);

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				$request = new WP_REST_Request( 'DELETE', '/wp/v2/blocks/' . $post_id );

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				wp_delete_post( $post_id );

				break;

			case 'update_delete_others':
				$request = new WP_REST_Request( 'PUT', '/wp/v2/blocks/' . self::$post_id );
				$request->set_body_params(
					array(
						'title'   => 'Test',
						'content' => '<!-- wp:core/paragraph --><p>Test</p><!-- /wp:core/paragraph -->',
					)
				);

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				$request = new WP_REST_Request( 'DELETE', '/wp/v2/blocks/' . self::$post_id );

				$response = rest_get_server()->dispatch( $request );
				$this->assertEquals( $expected_status, $response->get_status() );

				break;

			default:
				$this->fail( "'$action' is not a valid action." );
		}

		if ( isset( $user_id ) ) {
			self::delete_user( $user_id );
		}
	}

	public function test_context_param() {
		$this->markTestSkipped( 'Controller doesn\'t implement get_context_param().' );
	}
	public function test_prepare_item() {
		$this->markTestSkipped( 'Controller doesn\'t implement prepare_item().' );
	}
}

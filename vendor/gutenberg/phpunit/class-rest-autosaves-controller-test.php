<?php
/**
 * Unit tests covering WP_REST_Autosaves_Controller functionality.
 *
 * @package WordPress
 * @subpackage REST API
 */

/**
 * @group restapi-autosave
 * @group restapi
 */
class WP_Test_REST_Autosaves_Controller extends WP_Test_REST_Post_Type_Controller_Testcase {
	protected static $post_id;
	protected static $page_id;

	protected static $autosave_post_id;
	protected static $autosave_page_id;

	protected static $editor_id;
	protected static $contributor_id;

	protected function set_post_data( $args = array() ) {
		$defaults = array(
			'title'   => 'Post Title',
			'content' => 'Post content',
			'excerpt' => 'Post excerpt',
			'name'    => 'test',
			'author'  => get_current_user_id(),
		);

		return wp_parse_args( $args, $defaults );
	}

	protected function check_create_autosave_response( $response ) {
		$this->assertNotInstanceOf( 'WP_Error', $response );
		$response = rest_ensure_response( $response );
		$data     = $response->get_data();

		$this->assertArrayHasKey( 'content', $data );
		$this->assertArrayHasKey( 'excerpt', $data );
		$this->assertArrayHasKey( 'title', $data );
	}

	public static function wpSetUpBeforeClass( $factory ) {
		self::$post_id = $factory->post->create();
		self::$page_id = $factory->post->create( array( 'post_type' => 'page' ) );

		self::$editor_id      = $factory->user->create(
			array(
				'role' => 'editor',
			)
		);
		self::$contributor_id = $factory->user->create(
			array(
				'role' => 'contributor',
			)
		);

		wp_set_current_user( self::$editor_id );

		// Create an autosave.
		self::$autosave_post_id = wp_create_post_autosave(
			array(
				'post_content' => 'This content is better.',
				'post_ID'      => self::$post_id,
				'post_type'    => 'post',
			)
		);

		self::$autosave_page_id = wp_create_post_autosave(
			array(
				'post_content' => 'This content is better.',
				'post_ID'      => self::$page_id,
				'post_type'    => 'post',
			)
		);

	}

	public static function wpTearDownAfterClass() {
		// Also deletes revisions.
		wp_delete_post( self::$post_id, true );
		wp_delete_post( self::$page_id, true );

		self::delete_user( self::$editor_id );
		self::delete_user( self::$contributor_id );
	}

	public function setUp() {
		parent::setUp();
		wp_set_current_user( self::$editor_id );

		$this->post_autosave = wp_get_post_autosave( self::$post_id );
	}

	public function test_register_routes() {
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/wp/v2/posts/(?P<parent>[\d]+)/autosaves', $routes );
		$this->assertArrayHasKey( '/wp/v2/posts/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)', $routes );
		$this->assertArrayHasKey( '/wp/v2/pages/(?P<parent>[\d]+)/autosaves', $routes );
		$this->assertArrayHasKey( '/wp/v2/pages/(?P<parent>[\d]+)/autosaves/(?P<id>[\d]+)', $routes );
	}

	public function test_context_param() {

		// Collection.
		$request  = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertEquals( 'view', $data['endpoints'][0]['args']['context']['default'] );
		$this->assertEqualSets( array( 'view', 'edit', 'embed' ), $data['endpoints'][0]['args']['context']['enum'] );

		// Single.
		$request  = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertEquals( 'view', $data['endpoints'][0]['args']['context']['default'] );
		$this->assertEqualSets( array( 'view', 'edit', 'embed' ), $data['endpoints'][0]['args']['context']['enum'] );
	}

	public function test_get_items() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertEquals( 200, $response->get_status() );
		$this->assertCount( 1, $data );

		$this->assertEquals( self::$autosave_post_id, $data[0]['id'] );

		$this->check_get_autosave_response( $data[0], $this->post_autosave );
	}

	public function test_get_items_no_permission() {
		wp_set_current_user( 0 );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_read', $response, 401 );
		wp_set_current_user( self::$contributor_id );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_read', $response, 403 );
	}

	public function test_get_items_missing_parent() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . REST_TESTS_IMPOSSIBLY_HIGH_NUMBER . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_post_invalid_parent', $response, 404 );
	}

	public function test_get_items_invalid_parent_post_type() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$page_id . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_post_invalid_parent', $response, 404 );
	}

	public function test_get_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->check_get_autosave_response( $response, $this->post_autosave );
		$fields = array(
			'author',
			'date',
			'date_gmt',
			'modified',
			'modified_gmt',
			'guid',
			'id',
			'parent',
			'slug',
			'title',
			'excerpt',
			'content',
		);
		$this->assertEqualSets( $fields, array_keys( $data ) );
		$this->assertSame( self::$editor_id, $data['author'] );
	}

	public function test_get_item_embed_context() {
		wp_set_current_user( self::$editor_id );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		$request->set_param( 'context', 'embed' );
		$response = rest_get_server()->dispatch( $request );
		$fields   = array(
			'author',
			'date',
			'id',
			'parent',
			'slug',
			'title',
			'excerpt',
		);
		$data     = $response->get_data();
		$this->assertEqualSets( $fields, array_keys( $data ) );
	}

	public function test_get_item_no_permission() {
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		wp_set_current_user( self::$contributor_id );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_read', $response, 403 );
	}

	public function test_get_item_missing_parent() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . REST_TESTS_IMPOSSIBLY_HIGH_NUMBER . '/autosaves/' . self::$autosave_post_id );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_post_invalid_parent', $response, 404 );

	}

	public function test_get_item_invalid_parent_post_type() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$page_id . '/autosaves' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_post_invalid_parent', $response, 404 );
	}

	public function test_delete_item() {
		// Doesn't exist.
	}

	public function test_prepare_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$this->check_get_autosave_response( $response, $this->post_autosave );
	}

	public function test_get_item_schema() {
		$request    = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$response   = rest_get_server()->dispatch( $request );
		$data       = $response->get_data();
		$properties = $data['schema']['properties'];
		$this->assertEquals( 13, count( $properties ) );
		$this->assertArrayHasKey( 'author', $properties );
		$this->assertArrayHasKey( 'content', $properties );
		$this->assertArrayHasKey( 'date', $properties );
		$this->assertArrayHasKey( 'date_gmt', $properties );
		$this->assertArrayHasKey( 'excerpt', $properties );
		$this->assertArrayHasKey( 'guid', $properties );
		$this->assertArrayHasKey( 'id', $properties );
		$this->assertArrayHasKey( 'modified', $properties );
		$this->assertArrayHasKey( 'modified_gmt', $properties );
		$this->assertArrayHasKey( 'parent', $properties );
		$this->assertArrayHasKey( 'slug', $properties );
		$this->assertArrayHasKey( 'title', $properties );
		$this->assertArrayHasKey( 'preview_link', $properties );
	}

	public function test_create_item() {
		wp_set_current_user( self::$editor_id );

		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );

		$params = $this->set_post_data(
			array(
				'id' => self::$post_id,
			)
		);
		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );

		$this->check_create_autosave_response( $response );
	}

	public function test_update_item() {
		wp_set_current_user( self::$editor_id );
		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );

		$params = $this->set_post_data(
			array(
				'id'     => self::$post_id,
				'author' => self::$contributor_id,
			)
		);

		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );

		$this->check_create_autosave_response( $response );
	}

	public function test_update_item_nopriv() {
		wp_set_current_user( self::$contributor_id );

		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );

		$params = $this->set_post_data(
			array(
				'id'     => self::$post_id,
				'author' => self::$editor_id,
			)
		);

		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );

		$this->assertErrorResponse( 'rest_cannot_edit', $response, 403 );
	}

	public function test_rest_autosave_published_post() {
		wp_set_current_user( self::$editor_id );

		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/json' );

		$current_post = get_post( self::$post_id );

		$autosave_data = $this->set_post_data(
			array(
				'id'      => self::$post_id,
				'content' => 'Updated post \ content',
				'excerpt' => $current_post->post_excerpt,
				'title'   => $current_post->post_title,
			)
		);

		$request->set_body( wp_json_encode( $autosave_data ) );
		$response = rest_get_server()->dispatch( $request );
		$new_data = $response->get_data();

		$this->assertEquals( $current_post->ID, $new_data['parent'] );
		$this->assertEquals( $current_post->post_title, $new_data['title']['raw'] );
		$this->assertEquals( $current_post->post_excerpt, $new_data['excerpt']['raw'] );

		// Updated post_content.
		$this->assertNotEquals( $current_post->post_content, $new_data['content']['raw'] );

		$autosave_post = wp_get_post_autosave( self::$post_id );
		$this->assertEquals( $autosave_data['title'], $autosave_post->post_title );
		$this->assertEquals( $autosave_data['content'], $autosave_post->post_content );
		$this->assertEquals( $autosave_data['excerpt'], $autosave_post->post_excerpt );
	}

	public function test_rest_autosave_draft_post_same_author() {
		wp_set_current_user( self::$editor_id );

		$post_data = array(
			'post_content' => 'Test post content',
			'post_title'   => 'Test post title',
			'post_excerpt' => 'Test post excerpt',
		);
		$post_id   = wp_insert_post( $post_data );

		$autosave_data = array(
			'id'      => $post_id,
			'content' => 'Updated post \ content',
			'title'   => 'Updated post title',
		);

		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( $autosave_data ) );

		$response = rest_get_server()->dispatch( $request );
		$new_data = $response->get_data();
		$post     = get_post( $post_id );

		$this->assertEquals( $post_id, $new_data['id'] );
		// The draft post should be updated.
		$this->assertEquals( $autosave_data['content'], $new_data['content']['raw'] );
		$this->assertEquals( $autosave_data['title'], $new_data['title']['raw'] );
		$this->assertEquals( $autosave_data['content'], $post->post_content );
		$this->assertEquals( $autosave_data['title'], $post->post_title );

		// Not updated.
		$this->assertEquals( $post_data['post_excerpt'], $post->post_excerpt );

		wp_delete_post( $post_id );
	}

	public function test_rest_autosave_draft_post_different_author() {
		wp_set_current_user( self::$editor_id );

		$post_data = array(
			'post_content' => 'Test post content',
			'post_title'   => 'Test post title',
			'post_excerpt' => 'Test post excerpt',
			'post_author'  => self::$editor_id + 1,
		);
		$post_id   = wp_insert_post( $post_data );

		$autosave_data = array(
			'id'      => $post_id,
			'content' => 'Updated post content',
			'excerpt' => $post_data['post_excerpt'],
			'title'   => $post_data['post_title'],
		);

		$request = new WP_REST_Request( 'POST', '/wp/v2/posts/' . self::$post_id . '/autosaves' );
		$request->add_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( $autosave_data ) );

		$response     = rest_get_server()->dispatch( $request );
		$new_data     = $response->get_data();
		$current_post = get_post( $post_id );

		$this->assertEquals( $current_post->ID, $new_data['parent'] );

		// The draft post shouldn't change.
		$this->assertEquals( $current_post->post_title, $post_data['post_title'] );
		$this->assertEquals( $current_post->post_content, $post_data['post_content'] );
		$this->assertEquals( $current_post->post_excerpt, $post_data['post_excerpt'] );

		$autosave_post = wp_get_post_autosave( $post_id );

		// No changes.
		$this->assertEquals( $current_post->post_title, $autosave_post->post_title );
		$this->assertEquals( $current_post->post_excerpt, $autosave_post->post_excerpt );

		// Has changes.
		$this->assertEquals( $autosave_data['content'], $autosave_post->post_content );

		wp_delete_post( $post_id );
	}

	public function test_get_additional_field_registration() {
		$schema = array(
			'type'        => 'integer',
			'description' => 'Some integer of mine',
			'enum'        => array( 1, 2, 3, 4 ),
			'context'     => array( 'view', 'edit' ),
		);

		register_rest_field(
			'post-revision', 'my_custom_int', array(
				'schema'          => $schema,
				'get_callback'    => array( $this, 'additional_field_get_callback' ),
				'update_callback' => array( $this, 'additional_field_update_callback' ),
			)
		);

		$request = new WP_REST_Request( 'OPTIONS', '/wp/v2/posts/' . self::$post_id . '/autosaves' );

		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();

		$this->assertArrayHasKey( 'my_custom_int', $data['schema']['properties'] );
		$this->assertEquals( $schema, $data['schema']['properties']['my_custom_int'] );

		wp_set_current_user( 1 );

		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );

		$response = rest_get_server()->dispatch( $request );
		$this->assertArrayHasKey( 'my_custom_int', $response->data );

		global $wp_rest_additional_fields;
		$wp_rest_additional_fields = array();
	}

	public function additional_field_get_callback( $object ) {
		return get_post_meta( $object['id'], 'my_custom_int', true );
	}

	public function additional_field_update_callback( $value, $post ) {
		update_post_meta( $post->ID, 'my_custom_int', $value );
	}

	protected function check_get_autosave_response( $response, $autosave ) {
		if ( $response instanceof WP_REST_Response ) {
			$links    = $response->get_links();
			$response = $response->get_data();
		} else {
			$this->assertArrayHasKey( '_links', $response );
			$links = $response['_links'];
		}

		$this->assertEquals( $autosave->post_author, $response['author'] );

		$rendered_content = apply_filters( 'the_content', $autosave->post_content );
		$this->assertEquals( $rendered_content, $response['content']['rendered'] );

		$this->assertEquals( mysql_to_rfc3339( $autosave->post_date ), $response['date'] ); //@codingStandardsIgnoreLine
		$this->assertEquals( mysql_to_rfc3339( $autosave->post_date_gmt ), $response['date_gmt'] ); //@codingStandardsIgnoreLine

		$rendered_guid = apply_filters( 'get_the_guid', $autosave->guid, $autosave->ID );
		$this->assertEquals( $rendered_guid, $response['guid']['rendered'] );

		$this->assertEquals( $autosave->ID, $response['id'] );
		$this->assertEquals( mysql_to_rfc3339( $autosave->post_modified ), $response['modified'] ); //@codingStandardsIgnoreLine
		$this->assertEquals( mysql_to_rfc3339( $autosave->post_modified_gmt ), $response['modified_gmt'] ); //@codingStandardsIgnoreLine
		$this->assertEquals( $autosave->post_name, $response['slug'] );

		$rendered_title = get_the_title( $autosave->ID );
		$this->assertEquals( $rendered_title, $response['title']['rendered'] );

		$parent            = get_post( $autosave->post_parent );
		$parent_controller = new WP_REST_Posts_Controller( $parent->post_type );
		$parent_object     = get_post_type_object( $parent->post_type );
		$parent_base       = ! empty( $parent_object->rest_base ) ? $parent_object->rest_base : $parent_object->name;
		$this->assertEquals( rest_url( '/wp/v2/' . $parent_base . '/' . $autosave->post_parent ), $links['parent'][0]['href'] );
	}

	public function test_get_item_sets_up_postdata() {
		wp_set_current_user( self::$editor_id );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . self::$post_id . '/autosaves/' . self::$autosave_post_id );
		rest_get_server()->dispatch( $request );

		$post           = get_post();
		$parent_post_id = wp_is_post_revision( $post->ID );

		$this->assertEquals( $post->ID, self::$autosave_post_id );
		$this->assertEquals( $parent_post_id, self::$post_id );
	}

}

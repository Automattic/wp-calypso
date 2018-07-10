<?php
/**
 * WP_Block_Type_Registry Tests
 *
 * @package Gutenberg
 */

/**
 * Tests for WP_Block_Type_Registry
 */
class Gutenberg_REST_API_Test extends WP_Test_REST_TestCase {
	function setUp() {
		parent::setUp();

		$this->administrator = $this->factory->user->create( array(
			'role' => 'administrator',
		) );
		$this->author        = $this->factory->user->create( array(
			'role' => 'author',
		) );
		$this->editor        = $this->factory->user->create( array(
			'role' => 'editor',
		) );
		$this->contributor   = $this->factory->user->create( array(
			'role' => 'contributor',
		) );
		$this->subscriber    = $this->factory->user->create(
			array(
				'role'         => 'subscriber',
				'display_name' => 'subscriber',
				'user_email'   => 'subscriber@example.com',
			)
		);
	}

	function tearDown() {
		parent::tearDown();
	}

	/**
	 * Should return an extra visibility field on response when in edit context.
	 */
	function test_visibility_field() {
		wp_set_current_user( $this->administrator );

		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertTrue( isset( $result['visibility'] ) );
		$this->assertInternalType( 'array', $result['visibility'] );
		$this->assertArrayHasKey( 'public', $result['visibility'] );
		$this->assertArrayHasKey( 'publicly_queryable', $result['visibility'] );
		$this->assertArrayHasKey( 'show_ui', $result['visibility'] );
		$this->assertArrayHasKey( 'show_admin_column', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_nav_menus', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_quick_edit', $result['visibility'] );
	}

	/**
	 * Should return an extra visibility field on response.
	 */
	function test_visibility_field_for_non_admin_roles() {
		wp_set_current_user( $this->editor );

		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertTrue( isset( $result['visibility'] ) );
		$this->assertInternalType( 'array', $result['visibility'] );
		$this->assertArrayHasKey( 'public', $result['visibility'] );
		$this->assertArrayHasKey( 'publicly_queryable', $result['visibility'] );
		$this->assertArrayHasKey( 'show_ui', $result['visibility'] );
		$this->assertArrayHasKey( 'show_admin_column', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_nav_menus', $result['visibility'] );
		$this->assertArrayHasKey( 'show_in_quick_edit', $result['visibility'] );

		/**
		 * See https://github.com/WordPress/gutenberg/issues/2545
		 *
		 * Until that is resolved authors will not be able to set taxonomies.
		 * This should definitely be resolved though.
		 */
		wp_set_current_user( $this->author );

		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertFalse( isset( $result['visibility'] ) );
	}

	/**
	 * Should not return an extra visibility field without context set.
	 */
	function test_visibility_field_without_context() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/taxonomies/category' );
		$response = rest_do_request( $request );

		$result = $response->get_data();

		$this->assertFalse( isset( $result['visibility'] ) );
	}

	/**
	 * Should return an extra viewable field on response when in edit context.
	 */
	function test_viewable_field() {
		wp_set_current_user( $this->administrator );
		$request = new WP_REST_Request( 'GET', '/wp/v2/types/post' );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['viewable'] ) );
		$this->assertTrue( $result['viewable'] );
	}

	/**
	 * Should not return viewable field without context set.
	 */
	function test_viewable_field_without_context() {
		$request  = new WP_REST_Request( 'GET', '/wp/v2/types/post' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertFalse( isset( $result['viewable'] ) );
	}

	/**
	 * Only returns wp:action-unfiltered_html when current user can use unfiltered HTML.
	 * See https://codex.wordpress.org/Roles_and_Capabilities#Capability_vs._Role_Table
	 */
	function test_link_unfiltered_html() {
		$post_id   = $this->factory->post->create();
		$check_key = 'https://api.w.org/action-unfiltered_html';
		// admins can in a single site, but can't in a multisite.
		wp_set_current_user( $this->administrator );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		if ( is_multisite() ) {
			$this->assertFalse( isset( $links[ $check_key ] ) );
		} else {
			$this->assertTrue( isset( $links[ $check_key ] ) );
		}
		// authors can't.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// editors can in a single site, but can't in a multisite.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		if ( is_multisite() ) {
			$this->assertFalse( isset( $links[ $check_key ] ) );
		} else {
			$this->assertTrue( isset( $links[ $check_key ] ) );
		}
		// contributors can't.
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns wp:action-assign-author when current user can assign author.
	 */
	function test_link_assign_author_only_appears_for_editor() {
		$post_id   = $this->factory->post->create();
		$check_key = 'https://api.w.org/action-assign-author';
		// authors cannot assign author.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// editors can assign author.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// editors can assign author but not included for context != edit.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns wp:action-publish when current user can publish.
	 */
	function test_link_publish_only_appears_for_author() {
		$post_id   = $this->factory->post->create( array(
			'post_author' => $this->author,
		) );
		$check_key = 'https://api.w.org/action-publish';
		// contributors cannot sticky.
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// authors can publish.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// authors can publish but not included for context != edit.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns wp:action-sticky when current user can sticky.
	 */
	function test_link_sticky_only_appears_for_editor() {
		$post_id   = $this->factory->post->create();
		$check_key = 'https://api.w.org/action-sticky';
		// authors cannot sticky.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
		// editors can sticky.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $check_key ] ) );
		// editors can sticky but not included for context != edit.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $post_id );
		$request->set_param( 'context', 'view' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertFalse( isset( $links[ $check_key ] ) );
	}

	/**
	 * Only returns term-related actions when current user can do so.
	 */
	function test_link_term_management_per_user() {
		$contributor_post  = $this->factory->post->create( array(
			'post_author' => $this->contributor,
			'post_status' => 'draft',
		) );
		$author_post       = $this->factory->post->create( array(
			'post_author' => $this->author,
		) );
		$create_tags       = 'https://api.w.org/action-create-tags';
		$assign_tags       = 'https://api.w.org/action-assign-tags';
		$create_categories = 'https://api.w.org/action-create-categories';
		$assign_categories = 'https://api.w.org/action-assign-categories';
		// Contributors can create and assign tags, but only assign categories.
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $contributor_post );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $create_tags ] ) );
		$this->assertTrue( isset( $links[ $assign_tags ] ) );
		$this->assertFalse( isset( $links[ $create_categories ] ) );
		$this->assertTrue( isset( $links[ $assign_categories ] ) );
		// Authors can create and assign tags, but only assign categories.
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $author_post );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $create_tags ] ) );
		$this->assertTrue( isset( $links[ $assign_tags ] ) );
		$this->assertFalse( isset( $links[ $create_categories ] ) );
		$this->assertTrue( isset( $links[ $assign_categories ] ) );
		// Editors can do everything.
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/posts/' . $author_post );
		$request->set_param( 'context', 'edit' );
		$response = rest_do_request( $request );
		$links    = $response->get_links();
		$this->assertTrue( isset( $links[ $create_tags ] ) );
		$this->assertTrue( isset( $links[ $assign_tags ] ) );
		$this->assertTrue( isset( $links[ $create_categories ] ) );
		$this->assertTrue( isset( $links[ $assign_categories ] ) );
	}

	/**
	 * Should include relevant data in the 'theme_supports' key of index.
	 */
	function test_theme_supports_index() {
		$request  = new WP_REST_Request( 'GET', '/' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['theme_supports'] ) );
		$this->assertTrue( isset( $result['theme_supports']['formats'] ) );
		$this->assertTrue( in_array( 'standard', $result['theme_supports']['formats'] ) );
	}

	public function test_theme_supports_post_thumbnails_false() {
		remove_theme_support( 'post-thumbnails' );
		$request  = new WP_REST_Request( 'GET', '/' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['theme_supports'] ) );
		$this->assertFalse( isset( $result['theme_supports']['post-thumbnails'] ) );
	}

	public function test_theme_supports_post_thumbnails_true() {
		remove_theme_support( 'post-thumbnails' );
		add_theme_support( 'post-thumbnails' );
		$request  = new WP_REST_Request( 'GET', '/' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['theme_supports'] ) );
		$this->assertEquals( true, $result['theme_supports']['post-thumbnails'] );
	}

	public function test_theme_supports_post_thumbnails_array() {
		remove_theme_support( 'post-thumbnails' );
		add_theme_support( 'post-thumbnails', array( 'post' ) );
		$request  = new WP_REST_Request( 'GET', '/' );
		$response = rest_do_request( $request );
		$result   = $response->get_data();
		$this->assertTrue( isset( $result['theme_supports'] ) );
		$this->assertEquals( array( 'post' ), $result['theme_supports']['post-thumbnails'] );
	}

	public function test_get_taxonomies_context_edit() {
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies' );
		$request->set_param( 'context', 'edit' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
		$data       = $response->get_data();
		$taxonomies = array();
		foreach ( get_taxonomies( '', 'objects' ) as $taxonomy ) {
			if ( ! empty( $taxonomy->show_in_rest ) ) {
				$taxonomies[] = $taxonomy;
			}
		}
		$this->assertEquals( count( $taxonomies ), count( $data ) );
		$this->assertEquals( 'Categories', $data['category']['name'] );
		$this->assertEquals( 'category', $data['category']['slug'] );
		$this->assertEquals( true, $data['category']['hierarchical'] );
		$this->assertEquals( 'Tags', $data['post_tag']['name'] );
		$this->assertEquals( 'post_tag', $data['post_tag']['slug'] );
		$this->assertEquals( false, $data['post_tag']['hierarchical'] );
		$this->assertEquals( 'tags', $data['post_tag']['rest_base'] );
	}

	public function test_get_taxonomies_invalid_permission_for_context() {
		wp_set_current_user( $this->subscriber );
		$request = new WP_REST_Request( 'GET', '/wp/v2/taxonomies' );
		$request->set_param( 'context', 'edit' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_view', $response, 403 );
	}

	public function test_create_category_incorrect_permissions_author() {
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'POST', '/wp/v2/categories' );
		$request->set_param( 'name', 'Incorrect permissions' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_create', $response, 403 );
	}

	public function test_create_category_editor() {
		wp_set_current_user( $this->editor );
		$request = new WP_REST_Request( 'POST', '/wp/v2/categories' );
		$request->set_param( 'name', 'My Awesome Term' );
		$request->set_param( 'description', 'This term is so awesome.' );
		$request->set_param( 'slug', 'so-awesome' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );
		$headers = $response->get_headers();
		$data    = $response->get_data();
		$this->assertContains( '/wp/v2/categories/' . $data['id'], $headers['Location'] );
		$this->assertEquals( 'My Awesome Term', $data['name'] );
		$this->assertEquals( 'This term is so awesome.', $data['description'] );
		$this->assertEquals( 'so-awesome', $data['slug'] );
	}

	public function test_create_tag_incorrect_permissions_subscriber() {
		wp_set_current_user( $this->subscriber );
		$request = new WP_REST_Request( 'POST', '/wp/v2/tags' );
		$request->set_param( 'name', 'Incorrect permissions' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_cannot_create', $response, 403 );
	}

	public function test_create_tag_contributor() {
		wp_set_current_user( $this->contributor );
		$request = new WP_REST_Request( 'POST', '/wp/v2/tags' );
		$request->set_param( 'name', 'My Awesome Term' );
		$request->set_param( 'description', 'This term is so awesome.' );
		$request->set_param( 'slug', 'so-awesome' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 201, $response->get_status() );
		$headers = $response->get_headers();
		$data    = $response->get_data();
		$this->assertContains( '/wp/v2/tags/' . $data['id'], $headers['Location'] );
		$this->assertEquals( 'My Awesome Term', $data['name'] );
		$this->assertEquals( 'This term is so awesome.', $data['description'] );
		$this->assertEquals( 'so-awesome', $data['slug'] );
	}

	public function test_get_items_unbounded_per_page() {
		wp_set_current_user( $this->author );
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_items_unbounded_per_page_unauthorized() {
		wp_set_current_user( $this->subscriber );
		$request = new WP_REST_Request( 'GET', '/wp/v2/users' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_per_page', $data['code'] );
	}

	public function test_get_categories_unbounded_per_page() {
		wp_set_current_user( $this->author );
		$this->factory->category->create();
		$request = new WP_REST_Request( 'GET', '/wp/v2/categories' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_categories_unbounded_per_page_unauthorized() {
		wp_set_current_user( $this->subscriber );
		$this->factory->category->create();
		$request = new WP_REST_Request( 'GET', '/wp/v2/categories' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_per_page', $data['code'] );
	}

	public function test_get_pages_unbounded_per_page() {
		wp_set_current_user( $this->author );
		$this->factory->post->create( array( 'post_type' => 'page' ) );
		$request = new WP_REST_Request( 'GET', '/wp/v2/pages' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_pages_unbounded_per_page_unauthorized() {
		wp_set_current_user( $this->subscriber );
		$this->factory->post->create( array( 'post_type' => 'page' ) );
		$request = new WP_REST_Request( 'GET', '/wp/v2/pages' );
		$request->set_param( 'per_page', '-1' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 403, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'rest_forbidden_per_page', $data['code'] );
	}

	public function test_get_post_links_predecessor_version() {
		$post_id = $this->factory->post->create();
		wp_update_post(
			array(
				'post_content' => 'This content is marvelous.',
				'ID'           => $post_id,
			)
		);
		$revisions  = wp_get_post_revisions( $post_id );
		$revision_1 = array_pop( $revisions );

		$request  = new WP_REST_Request( 'GET', sprintf( '/wp/v2/posts/%d', $post_id ) );
		$response = rest_get_server()->dispatch( $request );

		$links = $response->get_links();

		$this->assertEquals( rest_url( '/wp/v2/posts/' . $post_id . '/revisions' ), $links['version-history'][0]['href'] );
		$this->assertEquals( 1, $links['version-history'][0]['attributes']['count'] );

		$this->assertEquals( rest_url( '/wp/v2/posts/' . $post_id . '/revisions/' . $revision_1->ID ), $links['predecessor-version'][0]['href'] );
		$this->assertEquals( $revision_1->ID, $links['predecessor-version'][0]['attributes']['id'] );
	}
}

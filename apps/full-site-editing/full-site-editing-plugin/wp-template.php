<?php

/**
 * Mostly a copy of how the `wp_block` is registered in core
 *
 * @return void
 */
function fse_register_wp_template() {
	register_post_type(
		'wp_template',
		array(
			'labels'                => array(
				'name'                     => _x( 'Templates', 'post type general name' ),
				'singular_name'            => _x( 'Template', 'post type singular name' ),
				'menu_name'                => _x( 'Templates', 'admin menu' ),
				'name_admin_bar'           => _x( 'Template', 'add new on admin bar' ),
				'add_new'                  => _x( 'Add New', 'Template' ),
				'add_new_item'             => __( 'Add New Template' ),
				'new_item'                 => __( 'New Template' ),
				'edit_item'                => __( 'Edit Template' ),
				'view_item'                => __( 'View Template' ),
				'all_items'                => __( 'All Templates' ),
				'search_items'             => __( 'Search Templates' ),
				'not_found'                => __( 'No Templates found.' ),
				'not_found_in_trash'       => __( 'No Templates found in Trash.' ),
				'filter_items_list'        => __( 'Filter Templates list' ),
				'items_list_navigation'    => __( 'Templates list navigation' ),
				'items_list'               => __( 'Templates list' ),
				'item_published'           => __( 'Template published.' ),
				'item_published_privately' => __( 'Template published privately.' ),
				'item_reverted_to_draft'   => __( 'Template reverted to draft.' ),
				'item_scheduled'           => __( 'Template scheduled.' ),
				'item_updated'             => __( 'Template updated.' ),
			),
			'public'                => false,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'rewrite'               => false,
			'show_in_rest'          => true,
			'rest_base'             => 'Templates',
			'rest_controller_class' => 'A8C_REST_Templates_Controller',
			'capability_type'       => 'Template',
			'capabilities'          => array(
				// You need to be able to edit posts, in order to read Templates in their raw form.
				'read'                   => 'edit_posts',
				// You need to be able to publish posts, in order to create Templates.
				'create_posts'           => 'customize',
				'edit_posts'             => 'customize',
				'edit_published_posts'   => 'customize',
				'delete_published_posts' => 'customize',
				'edit_others_posts'      => 'customize',
				'delete_others_posts'    => 'customize',
			),
			'map_meta_cap'          => true,
			'supports'              => array(
				'title',
				'editor',
			),
		)
	);
}

/**
 * Based on `WP_REST_Blocks_Controller` from core
 */
class A8C_REST_Templates_Controller extends WP_REST_Posts_Controller {

	/**
	 * Checks if a block can be read.
	 *
	 * @param object $post Post object that backs the block.
	 * @return bool Whether the block can be read.
	 */
	public function check_read_permission( $post ) {
		// Ensure that the user is logged in and has the read_blocks capability.
		$post_type = get_post_type_object( $post->post_type );
		if ( ! current_user_can( $post_type->cap->read_post, $post->ID ) ) {
			return false;
		}

		return parent::check_read_permission( $post );
	}

	/**
	 * Filters a response based on the context defined in the schema.
	 *
	 * @param array  $data    Response data to fiter.
	 * @param string $context Context defined in the schema.
	 * @return array Filtered response.
	 */
	public function filter_response_by_context( $data, $context ) {
		$data = parent::filter_response_by_context( $data, $context );

		/*
		 * Remove `title.rendered` and `content.rendered` from the response. It
		 * doesn't make sense for a reusable block to have rendered content on its
		 * own, since rendering a block requires it to be inside a post or a page.
		 */
		unset( $data['title']['rendered'] );
		unset( $data['content']['rendered'] );

		return $data;
	}

	/**
	 * Retrieves the block's schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		$schema = parent::get_item_schema();

		/*
		 * Allow all contexts to access `title.raw` and `content.raw`. Clients always
		 * need the raw markup of a reusable block to do anything useful, e.g. parse
		 * it or display it in an editor.
		 */
		$schema['properties']['title']['properties']['raw']['context']   = array( 'view', 'edit' );
		$schema['properties']['content']['properties']['raw']['context'] = array( 'view', 'edit' );

		/*
		 * Remove `title.rendered` and `content.rendered` from the schema. It doesn’t
		 * make sense for a reusable block to have rendered content on its own, since
		 * rendering a block requires it to be inside a post or a page.
		 */
		unset( $schema['properties']['title']['properties']['rendered'] );
		unset( $schema['properties']['content']['properties']['rendered'] );

		return $schema;
	}

}

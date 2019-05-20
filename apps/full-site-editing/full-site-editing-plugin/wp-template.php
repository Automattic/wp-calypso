<?php

/**
 * Mostly a copy of how the `wp_block` is registered in core
 *
 * @return void
 */
function fse_register_template_post_types() {
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
				'not_found'                => __( 'No templates found.' ),
				'not_found_in_trash'       => __( 'No templates found in Trash.' ),
				'filter_items_list'        => __( 'Filter templates list' ),
				'items_list_navigation'    => __( 'Templates list navigation' ),
				'items_list'               => __( 'Templates list' ),
				'item_published'           => __( 'Template published.' ),
				'item_published_privately' => __( 'Template published privately.' ),
				'item_reverted_to_draft'   => __( 'Template reverted to draft.' ),
				'item_scheduled'           => __( 'Template scheduled.' ),
				'item_updated'             => __( 'Template updated.' ),
			),
			'menu_icon'             => 'dashicons-layout',
			'public'                => false,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'rewrite'               => false,
			'show_in_rest'          => true,
			'rest_base'             => 'templates',
			'rest_controller_class' => 'A8C_REST_Templates_Controller',
			'capability_type'       => 'template',
			'capabilities'          => array(
				// You need to be able to edit posts, in order to read templates in their raw form.
				'read'                   => 'edit_posts',
				// You need to be able to customize, in order to create templates.
				'create_posts'           => 'edit_theme_options',
				'edit_posts'             => 'edit_theme_options',
				'delete_posts'           => 'edit_theme_options',
				'edit_published_posts'   => 'edit_theme_options',
				'delete_published_posts' => 'edit_theme_options',
				'edit_others_posts'      => 'edit_theme_options',
				'delete_others_posts'    => 'edit_theme_options',
				'publish_posts'          => 'edit_theme_options'
			),
			'map_meta_cap'          => true,
			'supports'              => array(
				'title',
				'editor',
			),
		)
	);

	register_post_type(
		'wp_template_part',
		array(
			'labels'                => array(
				'name'                     => _x( 'Template Parts', 'post type general name' ),
				'singular_name'            => _x( 'Template Part', 'post type singular name' ),
				'menu_name'                => _x( 'Template Parts', 'admin menu' ),
				'name_admin_bar'           => _x( 'Template Part', 'add new on admin bar' ),
				'add_new'                  => _x( 'Add New', 'Template Part' ),
				'add_new_item'             => __( 'Add New Template Part' ),
				'new_item'                 => __( 'New Template Part' ),
				'edit_item'                => __( 'Edit Template Part' ),
				'view_item'                => __( 'View Template Part' ),
				'all_items'                => __( 'All Template Parts' ),
				'search_items'             => __( 'Search Template Parts' ),
				'not_found'                => __( 'No template parts found.' ),
				'not_found_in_trash'       => __( 'No template parts found in Trash.' ),
				'filter_items_list'        => __( 'Filter template parts list' ),
				'items_list_navigation'    => __( 'Template parts list navigation' ),
				'items_list'               => __( 'Template parts list' ),
				'item_published'           => __( 'Template part published.' ),
				'item_published_privately' => __( 'Template part published privately.' ),
				'item_reverted_to_draft'   => __( 'Template part reverted to draft.' ),
				'item_scheduled'           => __( 'Template part scheduled.' ),
				'item_updated'             => __( 'Template part updated.' ),
			),
			'menu_icon'             => 'dashicons-layout',
			'public'                => false,
			'show_ui'               => true,
			'show_in_menu'          => true,
			'rewrite'               => false,
			'show_in_rest'          => true,
			'rest_base'             => 'template_parts',
			'rest_controller_class' => 'A8C_REST_Templates_Controller',
			'capability_type'       => 'template_part',
			'capabilities'          => array(
				// You need to be able to edit posts, in order to read templates in their raw form.
				'read'                   => 'edit_posts',
				// You need to be able to customize, in order to create templates.
				'create_posts'           => 'edit_theme_options',
				'edit_posts'             => 'edit_theme_options',
				'delete_posts'           => 'edit_theme_options',
				'edit_published_posts'   => 'edit_theme_options',
				'delete_published_posts' => 'edit_theme_options',
				'edit_others_posts'      => 'edit_theme_options',
				'delete_others_posts'    => 'edit_theme_options',
				'publish_posts'          => 'edit_theme_options'
			),
			'map_meta_cap'          => true,
			'supports'              => array(
				'title',
				'editor',
			),
		)
	);

	register_taxonomy(
		'wp_template_part_type',
		'wp_template_part',
		array(
			'labels'             => array(
				'name'              => _x( 'Template Part Types', 'taxonomy general name' ),
				'singular_name'     => _x( 'Template Part Type', 'taxonomy singular name' ),
				'menu_name'         => _x( 'Template Part Types', 'admin menu' ),
				'all_items'         => __( 'All Template Part Types' ),
				'edit_item'         => __( 'Edit Template Part Type' ),
				'view_item'         => __( 'View Template Part Type' ),
				'update_item'       => __( 'Update Template Part Type' ),
				'add_new_item'      => __( 'Add New Template Part Type' ),
				'new_item_name'     => __( 'New Template Part Type' ),
				'parent_item'       => __( 'Parent Template Part Type' ),
				'parent_item_colon' => __( 'Parent Template Part Type:' ),
				'search_items'      => __( 'Search Template Part Types' ),
				'not_found'         => __( 'No template part types found.' ),
				'back_to_items'     => __( 'Back to template part types' ),
			),
			'public'             => false,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => false,
			'show_in_nav_menu'   => false,
			'show_in_rest'       => true,
			'rest_base'          => 'template_part_types',
			'show_tagcloud'      => false,
			'show_admin_column'  => true,
			'hierarchical'       => true,
			'rewrite'            => false,
			'capabilities'       => array(
				'manage_terms' => 'edit_theme_options',
				'edit_terms'   => 'edit_theme_options',
				'delete_terms' => 'edit_theme_options',
				'assign_terms' => 'edit_theme_options',
			),
		)
	);
}

/**
 * Based on `WP_REST_Blocks_Controller` from core
 */
class A8C_REST_Templates_Controller extends WP_REST_Posts_Controller {

	/**
	 * Checks if a template can be read.
	 *
	 * @param object $post Post object that backs the template.
	 * @return bool Whether the template can be read.
	 */
	public function check_read_permission( $post ) {
		// Ensure that the user is logged in and has the edit_posts capability.
		$post_type = get_post_type_object( $post->post_type );
		if ( ! current_user_can( $post_type->cap->read_post, $post->ID ) ) {
			return false;
		}

		return parent::check_read_permission( $post );
	}

	/**
	 * Retrieves the template's schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		$schema = parent::get_item_schema();

		/*
		 * Allow all contexts to access `title.raw` and `content.raw`. Clients always
		 * need the raw markup of a reusable template to do anything useful, e.g. parse
		 * it or display it in an editor.
		 */
		$schema['properties']['title']['properties']['raw']['context']   = array( 'view', 'edit' );
		$schema['properties']['content']['properties']['raw']['context'] = array( 'view', 'edit' );

		return $schema;
	}

}

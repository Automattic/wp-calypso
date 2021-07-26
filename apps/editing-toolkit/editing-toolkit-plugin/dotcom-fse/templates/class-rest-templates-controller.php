<?php
/**
 * REST Templates Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Based on `WP_REST_Blocks_Controller` from core
 */
class REST_Templates_Controller extends \WP_REST_Posts_Controller {
	/**
	 * Override the get_items method.
	 *
	 * Gutenberg uses the route `/wp/v2/template_parts?wp_id=%s&context=edit` to retrieve the current post data when editing
	 * a template or template part, so we handle that here.
	 *
	 * @see https://github.com/WordPress/gutenberg/blob/6c94fb7a233e849e0fff51deffba6ab2866c60f4/packages/edit-post/src/editor.js#L71
	 *
	 * @param WP_REST_Request $request API request for template parts.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$template_id = $request['wp_id'];

		if ( $template_id ) {
			$request->set_param( 'include', array( $template_id ) );
		}

		return parent::get_items( $request );
	}

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

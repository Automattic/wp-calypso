<?php
/**
 * Shared blocks REST API: WP_REST_Blocks_Controller class
 *
 * @package gutenberg
 * @since 0.10.0
 */

/**
 * Controller which provides a REST endpoint for Gutenberg to read, create,
 * edit and delete shared blocks. Blocks are stored as posts with the wp_block
 * post type.
 *
 * @since 0.10.0
 *
 * @see WP_REST_Controller
 */
class WP_REST_Blocks_Controller extends WP_REST_Posts_Controller {
	/**
	 * Checks if a block can be read.
	 *
	 * @since 2.1.0
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
	 * Handle a DELETE request.
	 *
	 * @since 1.10.0
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $request ) {
		// Always hard-delete a block.
		$request->set_param( 'force', true );

		return parent::delete_item( $request );
	}

	/**
	 * Given an update or create request, build the post object that is saved to
	 * the database.
	 *
	 * @since 1.10.0
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return stdClass|WP_Error Post object or WP_Error.
	 */
	public function prepare_item_for_database( $request ) {
		$prepared_post = parent::prepare_item_for_database( $request );

		// Force blocks to always be published.
		$prepared_post->post_status = 'publish';

		return $prepared_post;
	}

	/**
	 * Given a block from the database, build the array that is returned from an
	 * API response.
	 *
	 * @since 1.10.0
	 *
	 * @param WP_Post         $post    Post object that backs the block.
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function prepare_item_for_response( $post, $request ) {
		$data = array(
			'id'      => $post->ID,
			'title'   => $post->post_title,
			'content' => $post->post_content,
		);

		$response = rest_ensure_response( $data );

		return apply_filters( "rest_prepare_{$this->post_type}", $response, $post, $request );
	}

	/**
	 * Builds the block's schema, conforming to JSON Schema.
	 *
	 * @since 1.10.0
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		return array(
			'$schema'    => 'http://json-schema.org/schema#',
			'title'      => $this->post_type,
			'type'       => 'object',
			'properties' => array(
				'id'      => array(
					'description' => __( 'Unique identifier for the block.', 'gutenberg' ),
					'type'        => 'integer',
					'readonly'    => true,
				),
				'title'   => array(
					'description' => __( 'The block\'s title.', 'gutenberg' ),
					'type'        => 'string',
					'required'    => true,
				),
				'content' => array(
					'description' => __( 'The block\'s HTML content.', 'gutenberg' ),
					'type'        => 'string',
					'required'    => true,
				),
			),
		);
	}
}

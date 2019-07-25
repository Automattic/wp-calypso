<?php
/**
 * WP_REST_Sideload_Image_Controller file.
 *
 * @package full-site-editing
 */

/**
 * Class WP_REST_Sideload_Image_Controller.
 */
class WP_REST_Sideload_Image_Controller extends WP_REST_Attachments_Controller {

	/**
	 * WP_REST_Sideload_Image_Controller constructor.
	 */
	public function __construct() {
		parent::__construct( 'attachment' );

		$this->namespace = 'fse/v1';
		$this->rest_base = 'sideload/image';
	}

	/**
	 * Register available routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_item' ],
					'permission_callback' => [ $this, 'create_item_permissions_check' ],
					'show_in_index'       => false,
					'args'                => [
						'url'     => [
							'description' => 'URL to the image to be side-loaded.',
							'type'        => 'string',
							'format'      => 'uri',
							'required'    => true,
						],
						'post_id' => [
							'description' => 'ID of the post to associate the image with',
							'type'        => 'integer',
							'default'     => 0,
						],
					],
				],
				'schema' => [ $this, 'get_item_schema' ],
			]
		);
	}

	/**
	 * Creates a single attachment.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response Response object on success, WP_Error object on failure.
	 */
	public function create_item( $request ) {
		if ( ! empty( $request['post_id'] ) && in_array( get_post_type( $request['post_id'] ), [ 'revision', 'attachment' ], true ) ) {
			return new WP_Error( 'rest_invalid_param', __( 'Invalid parent type.' ), [ 'status' => 400 ] );
		}

		// Include image functions to get access to wp_read_image_metadata().
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		// The post ID on success, WP_Error on failure.
		$id = media_sideload_image(
			$request->get_param( 'url' ),
			$request->get_param( 'post_id' ),
			null,
			'id'
		);

		if ( is_wp_error( $id ) ) {
			if ( 'db_update_error' === $id->get_error_code() ) {
				$id->add_data( [ 'status' => 500 ] );
			} else {
				$id->add_data( [ 'status' => 400 ] );
			}

			return rest_ensure_response( $id ); // Return error.
		}

		$attachment = get_post( $id );

		/**
		 * Fires after a single attachment is created or updated via the REST API.
		 *
		 * @param WP_Post         $attachment Inserted or updated attachment object.
		 * @param WP_REST_Request $request    The request sent to the API.
		 * @param bool            $creating   True when creating an attachment, false when updating.
		 */
		do_action( 'rest_insert_attachment', $attachment, $request, true );

		if ( isset( $request['alt_text'] ) ) {
			update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $request['alt_text'] ) );
		}

		$fields_update = $this->update_additional_fields_for_object( $attachment, $request );

		if ( is_wp_error( $fields_update ) ) {
			return $fields_update;
		}

		$request->set_param( 'context', 'edit' );

		/**
		 * Fires after a single attachment is completely created or updated via the REST API.
		 *
		 * @param WP_Post         $attachment Inserted or updated attachment object.
		 * @param WP_REST_Request $request    Request object.
		 * @param bool            $creating   True when creating an attachment, false when updating.
		 */
		do_action( 'rest_after_insert_attachment', $attachment, $request, true );

		$response = $this->prepare_item_for_response( $attachment, $request );
		$response = rest_ensure_response( $response );
		$response->set_status( 201 );
		$response->header( 'Location', rest_url( sprintf( '%s/%s/%d', 'wp/v2', 'media', $id ) ) );

		return $response;
	}

	/**
	 * Prepares a single attachment output for response.
	 *
	 * @param WP_Post         $post    Attachment object.
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response Response object.
	 */
	public function prepare_item_for_response( $post, $request ) {
		$response = parent::prepare_item_for_response( $post, $request );
		$base     = 'wp/v2/media';

		foreach ( [ 'self', 'collection', 'about' ] as $link ) {
			$response->remove_link( $link );

		}

		$response->add_link( 'self', rest_url( trailingslashit( $base ) . $post->ID ) );
		$response->add_link( 'collection', rest_url( $base ) );
		$response->add_link( 'about', rest_url( 'wp/v2/types/' . $post->post_type ) );

		return $response;
	}
}

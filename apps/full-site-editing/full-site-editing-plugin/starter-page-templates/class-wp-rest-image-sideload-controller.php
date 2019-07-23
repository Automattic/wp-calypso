<?php
/**
 * WP_REST_Image_Sideload_Controller file.
 *
 * @package full-site-editing
 */

/**
 * Class WP_REST_Image_Sideload_Controller.
 */
class WP_REST_Image_Sideload_Controller extends WP_REST_Attachments_Controller {

	/**
	 * WP_REST_Image_Upload_Controller constructor.
	 */
	public function __construct() {
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
						'url' => [
							'description' => 'URL to the image to be side-loaded.',
							'type'        => 'string',
							'format'      => 'uri',
							'required'    => true,
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
		if ( ! empty( $request['post'] ) && in_array( get_post_type( $request['post'] ), array( 'revision', 'attachment' ), true ) ) {
			return new WP_Error( 'rest_invalid_param', __( 'Invalid parent type.' ), array( 'status' => 400 ) );
		}

		// Include image functions to get access to wp_read_image_metadata().
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		// The post ID on success, WP_Error on failure.
		$id = media_sideload_image( $request->get_param( 'url' ), 0, null, 'id' );

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
		$response->header( 'Location', rest_url( sprintf( '%s/%s/%d', $this->namespace, 'media', $id ) ) );

		return $response;
	}
}

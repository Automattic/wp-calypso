<?php
/**
 * WP_REST_Sideload_Image_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_Sideload_Image_Controller.
 */
class WP_REST_Sideload_Image_Controller extends \WP_REST_Attachments_Controller {

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
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'show_in_index'       => false,
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/batch',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_items' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'show_in_index'       => false,
					'args'                => array(
						'resources' => array(
							'description' => 'URL to the image to be side-loaded.',
							'type'        => 'array',
							'required'    => true,
							'items'       => array(
								'type'       => 'object',
								'properties' => $this->get_collection_params(),
							),
						),
					),
				),
			)
		);
	}

	/**
	 * Creates a single attachment.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_Error|\WP_REST_Response Response object on success, WP_Error object on failure.
	 */
	public function create_item( $request ) {
		if ( ! empty( $request['post_id'] ) && in_array( get_post_type( $request['post_id'] ), array( 'revision', 'attachment' ), true ) ) {
			return new \WP_Error( 'rest_invalid_param', __( 'Invalid parent type.', 'full-site-editing' ), array( 'status' => 400 ) );
		}

		$inserted   = false;
		$attachment = $this->get_attachment( $request->get_param( 'url' ) );
		if ( ! $attachment ) {
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
					$id->add_data( array( 'status' => 500 ) );
				} else {
					$id->add_data( array( 'status' => 400 ) );
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

			update_post_meta( $id, '_sideloaded_url', $request->get_param( 'url' ) );

			$fields_update = $this->update_additional_fields_for_object( $attachment, $request );

			if ( is_wp_error( $fields_update ) ) {
				return $fields_update;
			}

			$inserted = true;
			$request->set_param( 'context', 'edit' );

			/**
			 * Fires after a single attachment is completely created or updated via the REST API.
			 *
			 * @param WP_Post         $attachment Inserted or updated attachment object.
			 * @param WP_REST_Request $request    Request object.
			 * @param bool            $creating   True when creating an attachment, false when updating.
			 */
			do_action( 'rest_after_insert_attachment', $attachment, $request, true );
		}

		$response = $this->prepare_item_for_response( $attachment, $request );
		$response = rest_ensure_response( $response );
		$response->header( 'Location', rest_url( sprintf( '%s/%s/%d', 'wp/v2', 'media', $attachment->ID ) ) );

		if ( $inserted ) {
			$response->set_status( 201 );
		}

		return $response;
	}

	/**
	 * Creates a batch of attachments.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_Error|\WP_REST_Response Response object on success, WP_Error object on failure.
	 */
	public function create_items( $request ) {
		$data = array();

		// Foreach request specified in the requests param, run the endpoint.
		foreach ( $request['resources'] as $resource ) {
			$request = new \WP_REST_Request( 'POST', $this->get_item_route() );

			// Add specified request parameters into the request.
			foreach ( $resource as $param_name => $param_value ) {
				$request->set_param( $param_name, $param_value );
			}

			$response = rest_do_request( $request );
			$data[]   = $this->prepare_for_collection( $response );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Prepare a response for inserting into a collection of responses.
	 *
	 * @param \WP_REST_Response $response Response object.
	 * @return array|\WP_REST_Response Response data, ready for insertion into collection data.
	 */
	public function prepare_for_collection( $response ) {
		if ( ! ( $response instanceof \WP_REST_Response ) ) {
			return $response;
		}

		$data   = (array) $response->get_data();
		$server = rest_get_server();

		if ( method_exists( $server, 'get_compact_response_links' ) ) {
			$links = call_user_func( array( $server, 'get_compact_response_links' ), $response );
		} else {
			$links = call_user_func( array( $server, 'get_response_links' ), $response );
		}

		if ( ! empty( $links ) ) {
			$data['_links'] = $links;
		}

		return $data;
	}

	/**
	 * Prepares a single attachment output for response.
	 *
	 * @param \WP_Post         $post    Attachment object.
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function prepare_item_for_response( $post, $request ) {
		$response = parent::prepare_item_for_response( $post, $request );
		$base     = 'wp/v2/media';

		foreach ( array( 'self', 'collection', 'about' ) as $link ) {
			$response->remove_link( $link );

		}

		$response->add_link( 'self', rest_url( trailingslashit( $base ) . $post->ID ) );
		$response->add_link( 'collection', rest_url( $base ) );
		$response->add_link( 'about', rest_url( 'wp/v2/types/' . $post->post_type ) );

		return $response;
	}

	/**
	 * Gets the attachment if an image has been sideloaded previously.
	 *
	 * @param string $url URL of the image to sideload.
	 * @return object|bool Attachment object on success, false on failure.
	 */
	public function get_attachment( $url ) {
		$cache_key  = 'fse_sideloaded_image_' . hash( 'crc32b', $url );
		$attachment = get_transient( $cache_key );

		if ( false === $attachment ) {
			$attachments = new \WP_Query(
				array(
					'no_found_rows'  => true,
					'posts_per_page' => 1,
					'post_status'    => 'inherit',
					'post_type'      => 'attachment',
					// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					'meta_query'     => array(
						array(
							'key'   => '_sideloaded_url',
							'value' => $url,
						),
					),
				)
			);

			if ( $attachments->have_posts() ) {
				set_transient( $cache_key, $attachments->post );
			}
		}

		return $attachment;
	}

	/**
	 * Returns the endpoints request parameters.
	 *
	 * @return array Request parameters.
	 */
	public function get_collection_params() {
		return array(
			'url'     => array(
				'description'       => 'URL to the image to be side-loaded.',
				'type'              => 'string',
				'required'          => true,
				'format'            => 'uri',
				'sanitize_callback' => function ( $url ) {
					return esc_url_raw( strtok( $url, '?' ) );
				},
			),
			'post_id' => array(
				'description' => 'ID of the post to associate the image with',
				'type'        => 'integer',
				'default'     => 0,
			),
		);
	}

	/**
	 * Returns the route to sideload a single image.
	 *
	 * @return string
	 */
	public function get_item_route() {
		return "/{$this->namespace}/{$this->rest_base}";
	}
}

<?php
/**
 * WP_REST_Batch_Controller file.
 *
 * @package full-site-editing
 * @see https://developer.wordpress.org/rest-api/requests/#internal-requests
 */

/**
 * Class WP_REST_Batch_Controller.
 */
class WP_REST_Batch_Controller extends WP_REST_Controller {

	/**
	 * WP_REST_Batch_Controller constructor.
	 */
	public function __construct() {
		$this->namespace = 'fse/v1';
		$this->rest_base = 'batch';
	}

	/**
	 * Register available routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				'methods'       => WP_REST_Server::CREATABLE,
				'callback'      => [ $this, 'handle_batch_requests' ],
				'show_in_index' => false,
				'args'          => [
					'requests' => [
						'description'       => 'An array of request objects arguments that can be built into WP_REST_Request instances.',
						'type'              => 'array',
						'required'          => true,
						'validate_callback' => [ $this, 'validate_requests' ],
						'items'             => [
							[
								'type'       => 'object',
								'properties' => [
									'method' => [
										'description' => 'HTTP Method of the desired request.',
										'type'        => 'string',
										'required'    => true,
										'enum'        => [
											'POST',
										],
									],
									'route'  => [
										'description' => 'Desired route for the request.',
										'required'    => true,
										'type'        => 'string',
										'format'      => 'uri',
									],
									'params' => [
										'description' => 'Key value pairs of desired request parameters.',
										'type'        => 'object',
									],
								],
							],
						],
					],
				],
			]
		);
	}

	/**
	 * This handles the building of the response for the batch requests we make.
	 *
	 * @param WP_REST_Request $request The current matched request object.
	 * @return WP_REST_Response A collection of response data for batch endpoints.
	 */
	public function handle_batch_requests( $request ) {
		$data = [];

		// Foreach request specified in the requests param, run the endpoint.
		foreach ( $request['requests'] as $request_params ) {
			$response       = $this->handle_request( $request_params );
			$key            = $request_params['method'] . ' ' . $request_params['route'];
			$data[ $key ][] = $this->prepare_for_collection( $response );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * This handles the building of the response for the batch requests we make.
	 *
	 * @param array $request_params Data to build a WP_REST_Request object from.
	 * @return WP_REST_Response Response data for the request.
	 */
	public function handle_request( $request_params ) {
		$request = new WP_REST_Request( $request_params['method'], $request_params['route'] );

		// Add specified request parameters into the request.
		if ( ! empty( $request_params['params'] ) ) {
			foreach ( $request_params['params'] as $param_name => $param_value ) {
				$request->set_param( $param_name, $param_value );
			}
		}

		return rest_do_request( $request );
	}

	/**
	 * Prepare a response for inserting into a collection of responses.
	 *
	 * @param WP_REST_Response $response Response object.
	 * @return array|WP_REST_Response Response data, ready for insertion into collection data.
	 */
	public function prepare_for_collection( $response ) {
		if ( ! ( $response instanceof WP_REST_Response ) ) {
			return $response;
		}

		$data   = (array) $response->get_data();
		$server = rest_get_server();

		if ( method_exists( $server, 'get_compact_response_links' ) ) {
			$links = call_user_func( [ $server, 'get_compact_response_links' ], $response );
		} else {
			$links = call_user_func( [ $server, 'get_response_links' ], $response );
		}

		if ( ! empty( $links ) ) {
			$data['_links'] = $links;
		}

		return $data;
	}

	/**
	 * Validates requests to be processed.
	 *
	 * @param array $requests Array of requests to process.
	 * @return bool|\WP_Error
	 */
	public function validate_requests( $requests ) {
		// If requests isn't an array of requests then we don't process the batch.
		if ( ! is_array( $requests ) ) {
			return new WP_Error( 'rest_invalid_param', 'The requests parameter must be an array of requests.', [ 'status' => 400 ] );
		}

		foreach ( $requests as $request ) {
			// If the method or route is not set then we do not run the requests.
			if ( ! isset( $request['method'] ) || ! isset( $request['route'] ) ) {
				return new WP_Error( 'rest_invalid_param', 'You must specify the method and route for each request.', [ 'status' => 400 ] );
			}

			if ( isset( $request['params'] ) && ! is_array( $request['params'] ) ) {
				return new WP_Error( 'rest_invalid_param', 'You must specify the params for each request as an array of named key value pairs.', [ 'status' => 400 ] );
			}
		}

		return true;
	}
}

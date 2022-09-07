<?php
/**
 * WP_REST_WPCOM_Block_Editor_Whats_New_Dot_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_Whats_New_Dot_Controller.
 */
class WP_REST_WPCOM_Block_Editor_Whats_New_Dot_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_Whats_New_Dot_Controller constructor.
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'block-editor/has-seen-whats-new-modal';
		$this->wpcom_is_site_specific_endpoint = false;
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'has_seen_whats_new_modal' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'set_has_seen_whats_new_modal' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'has_seen_whats_new_modal' => array(
							'required' => true,
							'type'     => 'boolean',
						),
					),
				),
			)
		);

	}

	/**
	 * Callback to determine whether the request can proceed.
	 *
	 * @return boolean
	 */
	public function permission_callback() {
		return is_user_logged_in();
	}

	/**
	 * Whether the user has seen the whats new modal
	 *
	 * @return WP_REST_Response
	 */
	public function has_seen_whats_new_modal() {
		if ( ! metadata_exists( 'user', get_current_user_id(), 'has_seen_whats_new_modal' ) ) {
			$has_seen_whats_new_modal = false;
		} else {
			$has_seen_whats_new_modal = filter_var( get_user_meta( get_current_user_id(), 'has_seen_whats_new_modal', true ), FILTER_VALIDATE_BOOLEAN );
		}

		return rest_ensure_response(
			array(
				'has_seen_whats_new_modal' => $has_seen_whats_new_modal,
			)
		);
	}

	/**
	 * Update the option for whether the user has seen the whats new modal.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_has_seen_whats_new_modal( $request ) {
		$params   = $request->get_json_params();
		$has_seen = (bool) $params['has_seen_whats_new_modal'];
		update_user_meta( get_current_user_id(), 'has_seen_whats_new_modal', $has_seen );
		return rest_ensure_response( array( 'has_seen_whats_new_modal' => $has_seen ) );
	}
}

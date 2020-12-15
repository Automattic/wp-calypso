<?php
/**
 * WP_REST_WPCOM_Block_Editor_NUX_Status_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_NUX_Status_Controller.
 */
class WP_REST_WPCOM_Block_Editor_NUX_Status_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_NUX_Status_Controller constructor.
	 */
	public function __construct() {
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'block-editor/nux';
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
					'callback'            => array( $this, 'get_nux_status' ),
					'permission_callback' => array( $this, 'permission_callback' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_nux_status' ),
					'permission_callback' => array( $this, 'permission_callback' ),
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
	 * Check if NUX is enabled.
	 *
	 * @param mixed $nux_status Can be "enabled", "dismissed", or undefined.
	 * @return boolean
	 */
	public function is_nux_enabled( $nux_status ) {
		if ( defined( 'SHOW_WELCOME_TOUR' ) && SHOW_WELCOME_TOUR ) {
			return true;
		}
		return 'enabled' === $nux_status;
	}

	/**
	 * Return the WPCOM NUX status
	 *
	 * @return WP_REST_Response
	 */
	public function get_nux_status() {
		if ( has_filter( 'wpcom_block_editor_nux_get_status' ) ) {
			$nux_status = apply_filters( 'wpcom_block_editor_nux_get_status', false );
		} elseif ( ! metadata_exists( 'user', get_current_user_id(), 'wpcom_block_editor_nux_status' ) ) {
			$nux_status = 'enabled';
		} else {
			$nux_status = get_user_meta( get_current_user_id(), 'wpcom_block_editor_nux_status', true );
		}
		return rest_ensure_response( array( 'is_nux_enabled' => $this->is_nux_enabled( $nux_status ) ) );
	}

	/**
	 * Update the WPCOM NUX status
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function update_nux_status( $request ) {
		$params     = $request->get_json_params();
		$nux_status = $params['isNuxEnabled'] ? 'enabled' : 'dismissed';
		if ( has_action( 'wpcom_block_editor_nux_update_status' ) ) {
			do_action( 'wpcom_block_editor_nux_update_status', $nux_status );
		}
		update_user_meta( get_current_user_id(), 'wpcom_block_editor_nux_status', $nux_status );
		return rest_ensure_response( array( 'is_nux_enabled' => $this->is_nux_enabled( $nux_status ) ) );
	}
}

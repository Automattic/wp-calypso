<?php
/**
 * WP_REST_WPCOM_Block_Editor_Seller_Celebration_Modal_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_Seller_Celebration_Modal_Controller.
 */
class WP_REST_WPCOM_Block_Editor_Seller_Celebration_Modal_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_Seller_Celebration_Modal_Controller constructor.
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'block-editor/has-seen-seller-celebration-modal';
		$this->wpcom_is_site_specific_endpoint = true;
		$this->wpcom_is_wpcom_only_endpoint    = true;
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
					'callback'            => array( $this, 'has_seen_seller_celebration_modal' ),
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
					'callback'            => array( $this, 'set_has_seen_seller_celebration_modal' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'has_seen_seller_celebration_modal' => array(
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
		return current_user_can( 'read' );
	}

	/**
	 * Whether the user has seen the seller celebration modal
	 *
	 * @return WP_REST_Response
	 */
	public function has_seen_seller_celebration_modal() {
		// See D69932-code and apps/editing-toolkit/editing-toolkit-plugin/wpcom-block-editor-nux/class-wp-rest-wpcom-block-editor-first-post-published-modal-controller.php.
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			return rest_ensure_response(
				array(
					'has_seen_seller_celebration_modal' => false,
				)
			);
		}
		$has_seen_seller_celebration_modal = (bool) get_option( 'has_seen_seller_celebration_modal', false );

		return rest_ensure_response(
			array(
				'has_seen_seller_celebration_modal' => $has_seen_seller_celebration_modal,
			)
		);
	}

	/**
	 * Update the option for whether the user has seen the seller celebration modal.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_has_seen_seller_celebration_modal( $request ) {
		$params = $request->get_json_params();
		update_option( 'has_seen_seller_celebration_modal', $params['has_seen_seller_celebration_modal'] );
		return rest_ensure_response( array( 'has_seen_seller_celebration_modal' => $params['has_seen_seller_celebration_modal'] ) );
	}
}

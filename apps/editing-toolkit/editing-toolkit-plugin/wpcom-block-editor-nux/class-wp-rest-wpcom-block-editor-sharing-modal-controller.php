<?php
/**
 * WP_REST_WPCOM_Block_Editor_Sharing_Modal_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_Sharing_Modal_Controller.
 */
class WP_REST_WPCOM_Block_Editor_Sharing_Modal_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_Sharing_Modal_Controller constructor.
	 */
	public function __construct() {
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'block-editor/sharing-modal-dismissed';

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script' ), 100 );
	}

	/**
	 * Enqueue sharing modal options.
	 */
	public function enqueue_script() {
		$modal_options = array(
			'isDismissed' => $this->get_wpcom_sharing_modal_dismissed(),
		);

		wp_add_inline_script(
			'wpcom-block-editor-nux-script',
			'var sharingModalOptions = ' . wp_json_encode( $modal_options, JSON_HEX_TAG | JSON_HEX_AMP ) . ';',
			'before'
		);
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
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'set_wpcom_sharing_modal_dismissed' ),
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
		return current_user_can( 'read' );
	}

	/**
	 * Get the sharing modal dismissed status
	 *
	 * @return boolean
	 */
	public function get_wpcom_sharing_modal_dismissed() {
		$old_sharing_modal_dismissed = (bool) get_option( 'sharing_modal_dismissed', false );
		if ( $old_sharing_modal_dismissed ) {
			return true;
		}
		return (bool) get_option( 'wpcom_sharing_modal_dismissed', false );
	}

	/**
	 * Dismiss the sharing modal
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_wpcom_sharing_modal_dismissed( $request ) {
		$params = $request->get_json_params();
		update_option( 'wpcom_sharing_modal_dismissed', $params['wpcom_sharing_modal_dismissed'] );
		return rest_ensure_response( array( 'wpcom_sharing_modal_dismissed' => $this->get_wpcom_sharing_modal_dismissed() ) );
	}
}

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
	 * Enqueue Launchpad options.
	 */
	public function enqueue_script() {
		$modal_options = array(
			'isDismissed' => $this->get_sharing_modal_dismissed(),
		);

		wp_add_inline_script(
			'jetpack-blocks-editor',
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
					'callback'            => array( $this, 'set_sharing_modal_dismissed' ),
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
	public function get_sharing_modal_dismissed() {
		// It appears that we are unable to set the `sharing_modal_dismissed` option on atomic sites
		// Therefore, hide the modal by default.
		// See D69932-code and apps/editing-toolkit/editing-toolkit-plugin/wpcom-block-editor-nux/class-wp-rest-wpcom-block-editor-first-post-published-modal-controller.php.
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			return true;
		}
		return (bool) get_option( 'sharing_modal_dismissed', false );
	}

	/**
	 * Dismiss the sharing modal
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_sharing_modal_dismissed( $request ) {
		$params = $request->get_json_params();
		update_option( 'sharing_modal_dismissed', $params['sharing_modal_dismissed'] );
		return rest_ensure_response( array( 'sharing_modal_dismissed' => $this->get_sharing_modal_dismissed() ) );
	}
}

<?php
/**
 * WP_REST_WPCOM_Block_Editor_Video_Redirect_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_Video_Redirect_Controller.
 */
class WP_REST_WPCOM_Block_Editor_Video_Redirect_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_Video_Redirect_Controller constructor.
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'block-editor/has-redirected-after-video-upload';
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
					'callback'            => array( $this, 'has_redirected_after_video_upload' ),
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
					'callback'            => array( $this, 'set_has_redirected_after_video_upload' ),
					'permission_callback' => array( $this, 'permission_callback' ),
					'args'                => array(
						'has_redirected_after_video_upload' => array(
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
	 * Whether the user has redirected back to the launchpad after uploading their first video.
	 *
	 * @return WP_REST_Response
	 */
	public function has_redirected_after_video_upload() {
		// See D69932-code and apps/editing-toolkit/editing-toolkit-plugin/wpcom-block-editor-nux/class-wp-rest-wpcom-block-editor-first-post-published-modal-controller.php.
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			return rest_ensure_response(
				array(
					'has_redirected_after_video_upload' => true,
				)
			);
		}
		$has_redirected_after_video_upload = (bool) get_option( 'has_redirected_after_video_upload', false );

		return rest_ensure_response(
			array(
				'has_redirected_after_video_upload' => $has_redirected_after_video_upload,
			)
		);
	}

	/**
	 * Update the option for whether the user has redirected to the launchpad after uploading their first video.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_has_redirected_after_video_upload( $request ) {
		$params = $request->get_json_params();
		update_option( 'has_redirected_after_video_upload', $params['has_redirected_after_video_upload'] );
		return rest_ensure_response( array( 'has_redirected_after_video_upload' => $params['has_redirected_after_video_upload'] ) );
	}
}

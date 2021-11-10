<?php
/**
 * WP_REST_WPCOM_Block_Editor_First_Post_Published_Modal_Controller file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_REST_WPCOM_Block_Editor_First_Post_Published_Modal_Controller.
 */
class WP_REST_WPCOM_Block_Editor_First_Post_Published_Modal_Controller extends \WP_REST_Controller {
	/**
	 * WP_REST_WPCOM_Block_Editor_First_Post_Published_Modal_Controller constructor.
	 */
	public function __construct() {
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'block-editor/should-show-first-post-published-modal';
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
					'callback'            => array( $this, 'should_show_first_post_published_modal' ),
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
	 * Should we show the first post published modal
	 *
	 * @return WP_REST_Response
	 */
	public function should_show_first_post_published_modal() {
		// We don't sync this option to AT sites because we cannot update the value on the AT sites now
		// Thus, the value on the AT sites is always false.
		$has_never_published_post        = (bool) get_option( 'has_never_published_post', false );
		$intent                          = get_option( 'site_intent', '' );
		$show_first_post_published_modal = $has_never_published_post && 'write' === $intent;

		return rest_ensure_response(
			array(
				'should_show_first_post_published_modal' => $show_first_post_published_modal,
			)
		);
	}
}

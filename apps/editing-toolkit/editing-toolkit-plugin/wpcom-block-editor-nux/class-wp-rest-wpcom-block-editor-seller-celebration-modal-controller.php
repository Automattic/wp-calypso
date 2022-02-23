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
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'block-editor/should-show-seller-celebration-modal';
	}

	/**
	 * Register available routes.
	 */
	public function register_rest_route() {
		l( '*****************' );
		l( 'initializing seller celebration route' );
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'should_show_seller_celebration_modal' ),
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
	 * Should we show the seller celebration modal
	 *
	 * @return WP_REST_Response
	 */
	public function should_show_seller_celebration_modal() {
		l( 'in handler' );
		// As we has synced the `has_never_published_post` option to part of atomic sites but we cannot
		// update the value now, always return false to avoid showing the modal at every publishing until
		// we can update the value on atomic sites. See D69932-code.
		if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
			return rest_ensure_response(
				array(
					'should_show_seller_celebration_modal' => false,
				)
			);
		}

		$has_seen_seller_celebration_modal    = (bool) get_option( 'has_seen_seller_celebration_modal', false );
		$intent                               = get_option( 'site_intent', '' );
		$should_show_seller_celebration_modal = ( ! $has_seen_seller_celebration_modal ) && 'sell' === $intent;

		return rest_ensure_response(
			array(
				'should_show_seller_celebration_modal' => $should_show_seller_celebration_modal,
			)
		);
	}
}

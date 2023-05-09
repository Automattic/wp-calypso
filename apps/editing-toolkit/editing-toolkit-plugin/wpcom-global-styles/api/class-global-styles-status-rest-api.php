<?php
/**
 * WPCOM Global Styles Info API.
 *
 * @package full-site-editing-plugin
 */

/**
 * This class contains the necessary endpoints to interact with global styles outside the editor context.
 */
class Global_Styles_Status_Rest_API extends WP_REST_Controller {

	/**
	 * Class constructor
	 */
	public function __construct() {
		$this->namespace                       = 'wpcom/v2';
		$this->rest_base                       = 'global-styles/status';
		$this->wpcom_is_site_specific_endpoint = true;
		$this->wpcom_is_wpcom_only_endpoint    = true;
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Here we register the routes this API will expose.
	 *
	 * @return void
	 */
	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_global_styles_info' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Checks if the user has the necessary permissions to get global styles information.
	 *
	 * @return bool|WP_Error
	 */
	public function permissions_check() {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return new WP_Error(
				'rest_cannot_view',
				__( 'Your user is not permitted to access this resource.', 'full-site-editing' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Returns if the current blog has Global Styles in use and if Global Styles should be limited.
	 *
	 * @return array
	 */
	public function get_global_styles_info() {
		return array(
			'globalStylesInUse'       => wpcom_global_styles_in_use(),
			'shouldLimitGlobalStyles' => wpcom_should_limit_global_styles(),
		);
	}
}

if ( function_exists( 'wpcom_rest_api_v2_load_plugin' ) ) {
	wpcom_rest_api_v2_load_plugin( 'Global_Styles_Status_Rest_API' );
}

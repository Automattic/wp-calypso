<?php declare( strict_types = 1 );

class Jetpack_Memberships {

	const MOCK_CONNECTED_ACCOUNT_ID_FILTER = 'mock_connected_account';

	/**
	 * @return self
	 */
	public static function get_instance() {
		return new self();
	}

	/**
	 * @return int
	 */
	public static function get_blog_id() {
		return 11;
	}

	/**
	 * @return int|false
	 */
	public static function get_connected_account_id() {
		// We can set that to 0 or false for testing the stripe connection flow
		return apply_filters( self::MOCK_CONNECTED_ACCOUNT_ID_FILTER, 4 );
	}

	/**
	 * @param  array $attrs
	 * @return ?string
	 */
	public function render_button( $attrs ) {
		$button_styles = array();
		if ( ! empty( $attrs['customBackgroundButtonColor'] ) ) {
			array_push(
				$button_styles,
				sprintf(
					'background-color: %s',
					sanitize_hex_color( $attrs['customBackgroundButtonColor'] ) ?? ''
				)
			);
		}
		if ( ! empty( $attrs['customTextButtonColor'] ) ) {
			array_push(
				$button_styles,
				sprintf(
					'color: %s',
					sanitize_hex_color( $attrs['customTextButtonColor'] ) ?? ''
				)
			);
		}
		$button_styles = implode( ';', $button_styles );

		return sprintf(
			'<div class="wp-block-jetpack-recurring-payments wp-block-button"><a role="button" href="%1$s" class="%2$s" style="%3$s">%4$s</a></div>',
			'/todo-mock-this-later',
			$attrs['submitButtonClasses'] ?? 'wp-block-button__link',
			esc_attr( $button_styles ),
			$attrs['submitButtonText']
		);
	}
}

/**
 * @return array
 */
function get_earn_cache() {
	 $previously_saved_data = get_option( 'earn_cache' );
	if ( $previously_saved_data ) {
		$previously_saved_data = json_decode( $previously_saved_data, true );
	} else {
		$previously_saved_data = array(
			'products' => array(),
		);
	}
	return $previously_saved_data;
}

/**
 * @return string
 */
function get_connect_url() : string {
	$user_id = 1;
	$blog_id = 1;
	$state   = base64_encode(
		json_encode(
			array(
				'blog_id' => $blog_id,
				'user_id' => $user_id,
				'nonce'   => '12321',
				'src'     => 'gutenberg',
			)
		)
	);
	$key     = 'ca_BePLvKOxmT9kmmpSVUjrDS0liCv2IFbz';
	return "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=$key&scope=read_write&state=$state";
}

// TODO: I think wp-compat.php is pulled via composer autoload and that is way to early.
// We have to kick out autoload files and load id via the normal flow.
if ( function_exists( 'add_action' ) ) {

	add_action(
		'rest_api_init',
		function () {
			register_rest_route(
				'wpcom/v2',
				'/memberships/status',
				array(
					'methods'  => 'GET',
					'callback' => function () {
						sleep( 2 ); // To make this load slower
						$products = get_earn_cache()['products'];
						array_reverse( $products );
						return array(
							'connected_account_id' => Jetpack_Memberships::get_connected_account_id(),
							'products'             => $products,
							'connect_url'          => get_connect_url(),
							'should_upgrade_to_access_memberships' => false, // We can mess with this to test the upgrade nudge
							'upgrade_url'          => 'http://mock-me-to-test-upgrade-nudge',
							'site_slug'            => 'mock-site-11',
						);
					},
				)
			);
			register_rest_route(
				'wpcom/v2',
				'/memberships/product',
				array(
					'methods'  => 'POST',
					'callback' => function ( WP_REST_Request $request ) {
						sleep( 2 ); // To make this load slower
						$prod                      = $request->get_params();
						$prod['id']                = rand( 10, 1000000 );
						$previous_data             = get_earn_cache();
						$previous_data['products'] = array_merge( $previous_data['products'], array( $prod ) );
						update_option( 'earn_cache', json_encode( $previous_data ) );
						return $prod;
					},
				)
			);
		}
	);
}

<?php declare( strict_types = 1 );

namespace A8C\FSE\EarnDev\SubscriptionService;

use A8C\FSE\Earn\PremiumContent\SubscriptionService\Subscription_Service;

use function rest_url;

require_once __DIR__ . '/class-paywall-response.php';

/**
 * Registers an endpoint to display a button to push to subcribe.
 *
 * The contract between the Subscription Service and the Mock_Paywall:
 *
 * 1. Mock_Paywall redirects or displays in an iframe the URL hosting the mock page (Mock_Paywall::subscribe_url)
 *    - The url requires a `redirect_uri` query parameter to send the user back to.
 * 2. On the Subscription Service page, when the user clicks "Do the thing!" the user is redirected back to
 *    the `redirect_uri` with an additional query parameter of `token` which contains the subscriber's token.
 * 3. Mock_Paywall stores the token as a cookie and "unlocks" the content.
 *
 * The "token" for Mock_Paywall is a string that says "subcriber".
 */
final class Mock_SubscriptionService implements Subscription_Service {


	const COOKIE_NAME      = 'mock-paywall';
	const TOKEN_QUERY_NAME = 'token';

	/**
	 * @return boolean
	 */
	public static function available() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public function visitor_can_view_content( $valid_plan_ids ) {
		$token = $this->token_from_query();
		if ( $token === null ) {
			$token = $this->token_from_cookie();
		}

		if ( $token === null ) {
			return false;
		}
		return $token === 'subscriber';
	}

	/**
	 * @inheritDoc
	 */
	public function initialize() {
		/**
		 * Allows non-JSON responses
		 */
     // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
		add_filter( 'rest_pre_serve_request', array( Paywall_Response::class, 'rest_pre_serve_request' ), 10, 2 );

		add_action(
			'rest_api_init',
			function () {
            // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
				register_rest_route( 'mock-paywall', 'subscribe', array( 'callback' => array( Paywall_Response::class, 'challenge' ) ) );
			}
		);

		$token = $this->token_from_query();
		if ( $token ) {
			// redirect to same url without token?
			setcookie( self::COOKIE_NAME, $token, 0, '/' );
		}
	}

	/**
	 * @inheritDoc
	 */
	public function access_url( $mode = 'subscribe' ) {
		global $wp;
		$current_url = add_query_arg( $wp->query_vars, home_url( $wp->request ) );

		return add_query_arg(
			array(
				'mode'         => $mode,
				'redirect_uri' => rawurlencode( $current_url ),
			),
			$this->url()
		);
	}

	/**
	 * @return string
	 */
	private function url() {
		return rest_url( '/mock-paywall/subscribe' );
	}

	/**
	 * @return ?string
	 */
	private function token_from_query() {
		return $_GET[ self::TOKEN_QUERY_NAME ] ?? null;
	}

	/**
	 * @return ?string
	 */
	private function token_from_cookie() {
		return $_COOKIE[ self::COOKIE_NAME ] ?? null;
	}

}

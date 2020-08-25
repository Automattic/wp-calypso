<?php declare( strict_types = 1 );
/**
 * @package A8C\FSE\Earn
 *
 * A paywall that exchanges JWT tokens from WordPress.com to allow
 * a current visitor to view content that has been deemed "Premium content".
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

use A8C\FSE\Earn\PremiumContent\JWT;

// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
abstract class Token_Subscription_Service implements Subscription_Service {


	const JWT_AUTH_TOKEN_COOKIE_NAME = 'jp-premium-content-session';
	const DECODE_EXCEPTION_FEATURE   = 'memberships';
	const DECODE_EXCEPTION_MESSAGE   = 'Problem decoding provided token';
	const REST_URL_ORIGIN            = 'https://subscribe.wordpress.com/';

	/**
	 * @inheritDoc
	 */
	public function initialize() {
		$token = $this->token_from_request();
		if ( $token !== null ) {
			$this->set_token_cookie( $token );
		}
	}

	/**
	 * The user is visiting with a subscriber token cookie.
	 *
	 * This is theoretically where the cookie JWT signature verification
	 * thing will happen.
	 *
	 * How to obtain one of these (or what exactly it is) is
	 * still a WIP (see api/auth branch)
	 *
	 * @inheritDoc
	 */
	public function visitor_can_view_content( $valid_plan_ids ) {

		// URL token always has a precedence, so it can overwrite the cookie when new data available.
		$token = $this->token_from_request();
		if ( $token ) {
			$this->set_token_cookie( $token );
		} else {
			$token = $this->token_from_cookie();
		}

		if ( empty( $token ) ) {
			// no token, no access
			return false;
		}

		$payload = $this->decode_token( $token );
		if ( empty( $payload ) ) {
			return false;
		}

		$subscriptions = (array) $payload['subscriptions'];
		return $this->validate_subscriptions( $valid_plan_ids, $subscriptions );
	}

	/**
	 * @param string $token
	 *
	 * @return array|false
	 */
	public function decode_token( $token ) {
		try {
			$key = $this->get_key();
			return $key ? (array) JWT::decode( $token, $key, array( 'HS256' ) ) : false;
		} catch ( \Exception $exception ) {
			// TODO: The SignatureInvalidException is in a different namespace from JWT, so if we want to catch that
			// one specifically then we'll have to alias it.
			$logstash = array(
				'feature' => self::DECODE_EXCEPTION_FEATURE,
				'message' => self::DECODE_EXCEPTION_MESSAGE,
				'extra'   => json_encode( compact( 'exception', 'token' ) ),
			);
         // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
			log2logstash( $logstash );
			return false;
		}
	}

	/**
	 * @return string|false
	 */
	abstract function get_key();

	/**
	 * @return int
	 */
	abstract function get_site_id();

	/**
	 * @inheritDoc
	 */
	public function access_url( $mode = 'subscribe' ) {
		global $wp;
		$permalink = get_permalink();
		if ( empty( $permalink ) ) {
			$permalink = add_query_arg( $wp->query_vars, home_url( $wp->request ) );
		}

		$login_url = $this->get_rest_api_token_url( $this->get_site_id(), $permalink );
		return $login_url;
	}

	/**
	 * @return ?string
	 */
	private function token_from_cookie() {
		if ( isset( $_COOKIE[ self::JWT_AUTH_TOKEN_COOKIE_NAME ] ) ) {
			return $_COOKIE[ self::JWT_AUTH_TOKEN_COOKIE_NAME ];
		}
	}

	/**
	 * @param  string $token
	 * @return void
	 */
	private function set_token_cookie( $token ) {
		if ( ! empty( $token ) ) {
			setcookie( self::JWT_AUTH_TOKEN_COOKIE_NAME, $token, 0, '/' );
		}
	}

	/**
	 * @return ?string
	 */
	private function token_from_request() {
		$token = null;
		if ( isset( $_GET['token'] ) ) {
			if ( preg_match( '/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/', $_GET['token'], $matches ) ) {
				// token matches a valid JWT token pattern
				$token = reset( $matches );
			}
		}
		return $token;
	}

	/**
	 * Return true if any ID/date pairs are valid. Otherwise false.
	 *
	 * @param int[]                          $valid_plan_ids
	 * @param array<int, Token_Subscription> $token_subscriptions : ID must exist in the provided <code>$valid_subscriptions</code> parameter.
	 *                                                            The provided end date needs to be greater than <code>now()</code>.
	 *
	 * @return bool
	 */
	protected function validate_subscriptions( $valid_plan_ids, $token_subscriptions ) {
		// Create a list of product_ids to compare against:
		$product_ids = array();
		foreach ( $valid_plan_ids as $plan_id ) {
			$product_id = (int) get_post_meta( $plan_id, 'jetpack_memberships_product_id', true );
			if ( isset( $product_id ) ) {
				$product_ids[] = $product_id;
			}
		}

		/**
		 * @var int $product_id
		 * @var Token_Subscription $token_subscription
		 */
		foreach ( $token_subscriptions as $product_id => $token_subscription ) {
			if ( in_array( $product_id, $product_ids, true ) ) {
				$end = is_int( $token_subscription->end_date ) ? $token_subscription->end_date : strtotime( $token_subscription->end_date );
				if ( $end > time() ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param  int    $site_id
	 * @param  string $redirect_url
	 * @return string
	 */
	private function get_rest_api_token_url( $site_id, $redirect_url ) {
		return sprintf( '%smemberships/jwt?site_id=%d&redirect_url=%s', self::REST_URL_ORIGIN, $site_id, urlencode( $redirect_url ) );
	}

}

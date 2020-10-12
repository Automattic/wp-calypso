<?php
/**
 * A paywall that exchanges JWT tokens from WordPress.com to allow
 * a current visitor to view content that has been deemed "Premium content".
 *
 * @package A8C\FSE\Earn
 */

declare( strict_types = 1 );

namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

use A8C\FSE\Earn\PremiumContent\JWT;

// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol

/**
 * Class Token_Subscription_Service
 *
 * @package A8C\FSE\Earn\PremiumContent\SubscriptionService
 */
abstract class Token_Subscription_Service implements Subscription_Service {

	const JWT_AUTH_TOKEN_COOKIE_NAME = 'jp-premium-content-session';
	const DECODE_EXCEPTION_FEATURE   = 'memberships';
	const DECODE_EXCEPTION_MESSAGE   = 'Problem decoding provided token';
	const REST_URL_ORIGIN            = 'https://subscribe.wordpress.com/';

	/**
	 * Initialize the token subscription service.
	 *
	 * @inheritDoc
	 */
	public function initialize() {
		$token = $this->token_from_request();
		if ( null !== $token ) {
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
	 *
	 * @param array $valid_plan_ids List of valid plan IDs.
	 */
	public function visitor_can_view_content( $valid_plan_ids ) {

		// URL token always has a precedence, so it can overwrite the cookie when new data available.
		$token = $this->token_from_request();
		if ( $token ) {
			$this->set_token_cookie( $token );
		} else {
			$token = $this->token_from_cookie();
		}

		$is_valid_token = true;

		if ( empty( $token ) ) {
			// no token, no access.
			$is_valid_token = false;
		} else {
			$payload = $this->decode_token( $token );
			if ( empty( $payload ) ) {
				$is_valid_token = false;
			}
		}

		if ( $is_valid_token ) {
			$subscriptions = (array) $payload['subscriptions'];
		} elseif ( is_user_logged_in() ) {
			// If there is no token, but the user is logged in, get current subscriptions and determine if the user has
			// a valid subscription to match the plan ID.
			$subscriptions = apply_filters( 'earn_get_user_subscriptions_for_site_id', array(), wp_get_current_user()->ID, $this->get_site_id() );
			if ( empty( $subscriptions ) ) {
				return false;
			}
			// format the subscriptions so that they can be validated.
			$subscriptions = self::abbreviate_subscriptions( $subscriptions );
		} else {
			return false;
		}

		return $this->validate_subscriptions( $valid_plan_ids, $subscriptions );
	}

	/**
	 * Decode the given token.
	 *
	 * @param string $token Token to decode.
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
				'extra'   => wp_json_encode( compact( 'exception', 'token' ) ),
			);
         // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
			log2logstash( $logstash );
			return false;
		}
	}

	/**
	 * Get the key for decoding the auth token.
	 *
	 * @return string|false
	 */
	abstract public function get_key();

	/**
	 * Get the ID of the current site.
	 *
	 * @return int
	 */
	abstract public function get_site_id();

	/**
	 * Get the URL to access the protected content.
	 *
	 * @param string $mode Access mode (either "subscribe" or "login").
	 */
	public function access_url( $mode = 'subscribe' ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		global $wp;
		$permalink = get_permalink();
		if ( empty( $permalink ) ) {
			$permalink = add_query_arg( $wp->query_vars, home_url( $wp->request ) );
		}

		$login_url = $this->get_rest_api_token_url( $this->get_site_id(), $permalink );
		return $login_url;
	}

	/**
	 * Get the token stored in the auth cookie.
	 *
	 * @return ?string
	 */
	private function token_from_cookie() {
		if ( isset( $_COOKIE[ self::JWT_AUTH_TOKEN_COOKIE_NAME ] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			return $_COOKIE[ self::JWT_AUTH_TOKEN_COOKIE_NAME ];
		}
	}

	/**
	 * Store the auth cookie.
	 *
	 * @param  string $token Auth token.
	 * @return void
	 */
	private function set_token_cookie( $token ) {
		if ( ! empty( $token ) ) {
			setcookie( self::JWT_AUTH_TOKEN_COOKIE_NAME, $token, 0, '/' );
		}
	}

	/**
	 * Get the token if present in the current request.
	 *
	 * @return ?string
	 */
	private function token_from_request() {
		$token = null;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['token'] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Recommended
			if ( preg_match( '/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/', $_GET['token'], $matches ) ) {
				// token matches a valid JWT token pattern.
				$token = reset( $matches );
			}
		}
		return $token;
	}

	/**
	 * Return true if any ID/date pairs are valid. Otherwise false.
	 *
	 * @param int[]                          $valid_plan_ids List of valid plan IDs.
	 * @param array<int, Token_Subscription> $token_subscriptions : ID must exist in the provided <code>$valid_subscriptions</code> parameter.
	 *                                                            The provided end date needs to be greater than <code>now()</code>.
	 *
	 * @return bool
	 */
	protected function validate_subscriptions( $valid_plan_ids, $token_subscriptions ) {
		// Create a list of product_ids to compare against.
		$product_ids = array();
		foreach ( $valid_plan_ids as $plan_id ) {
			$product_id = (int) get_post_meta( $plan_id, 'jetpack_memberships_product_id', true );
			if ( isset( $product_id ) ) {
				$product_ids[] = $product_id;
			}
		}

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
	 * Get the URL of the JWT endpoint.
	 *
	 * @param  int    $site_id Site ID.
	 * @param  string $redirect_url URL to redirect after checking the token validity.
	 * @return string URL of the JWT endpoint.
	 */
	private function get_rest_api_token_url( $site_id, $redirect_url ) {
		return sprintf( '%smemberships/jwt?site_id=%d&redirect_url=%s', self::REST_URL_ORIGIN, $site_id, rawurlencode( $redirect_url ) );
	}

	/**
	 * Report the subscriptions as an ID => [ 'end_date' => ]. mapping
	 *
	 * @param array $subscriptions_from_bd List of subscriptions from BD.
	 *
	 * @return array<int, array>
	 */
	public static function abbreviate_subscriptions( $subscriptions_from_bd ) {
		$subscriptions = array();
		foreach ( $subscriptions_from_bd as $subscription ) {
			// We are picking the expiry date that is the most in the future.
			if (
				'active' === $subscription['status'] && (
					! isset( $subscriptions[ $subscription['product_id'] ] ) ||
					empty( $subscription['end_date'] ) || // Special condition when subscription has no expiry date - we will default to a year from now for the purposes of the token.
					strtotime( $subscription['end_date'] ) > strtotime( (string) $subscriptions[ $subscription['product_id'] ]['end_date'] )
				)
			) {
				$subscriptions[ $subscription['product_id'] ]           = new \stdClass();
				$subscriptions[ $subscription['product_id'] ]->end_date = empty( $subscription['end_date'] ) ? ( time() + 365 * 24 * 3600 ) : $subscription['end_date'];
			}
		}
		return $subscriptions;
	}
}

<?php declare( strict_types = 1 );
/**
 * @package A8C\FSE\Earn
 *
 * This subscription service is used when a subscriber is offline and a token is not available.
 * This subscription service will be used when rendering content in email and reader on WPCOM only.
 * When content is being rendered, the current user and site are set.
 * This allows us to lookup a users subscriptions and determine if the
 * offline visitor can view content that has been deemed "Premium content".
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
class WPCOM_Offline_Subscription_Service extends WPCOM_Token_Subscription_Service {

	/**
	 * @return boolean
	 */
	public static function available() {
		// Return available if the user is logged in and either
		// running a job (sending email subscription) OR
		// handling API request on WPCOM (reader)
		return (
			( defined( 'WPCOM_JOBS' ) && WPCOM_JOBS ) ||
			( defined( 'IS_WPCOM' ) && IS_WPCOM === true && ( defined( 'REST_API_REQUEST' ) && REST_API_REQUEST ) )
			   ) && is_user_logged_in();
	}

	/**
	 * Lookup users subscriptions for a site and determine if the user has a valid subscription to match the plan ID
	 *
	 * @return bool
	 */
	public function visitor_can_view_content( $valid_plan_ids ) {
		$subscriptions = apply_filters( 'earn_get_user_subscriptions_for_site_id', array(), wp_get_current_user()->ID, $this->get_site_id() );
		if ( empty( $subscriptions ) ) {
			return false;
		}
		// format the subscriptions so that they can be validated
		$subscriptions = self::abbreviate_subscriptions( $subscriptions );
		return $this->validate_subscriptions( $valid_plan_ids, $subscriptions );
	}

	/**
	 * Report the subscriptions as an ID => [ 'end_date' => ]. mapping
	 *
	 * @param array $subscriptions_from_bd
	 *
	 * @return array<int, array>
	 */
	static function abbreviate_subscriptions( $subscriptions_from_bd ) {
		$subscriptions = array();
		foreach ( $subscriptions_from_bd as $subscription ) {
			// We are picking the expiry date that is the most in the future.
			if (
				$subscription['status'] === 'active' && (
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

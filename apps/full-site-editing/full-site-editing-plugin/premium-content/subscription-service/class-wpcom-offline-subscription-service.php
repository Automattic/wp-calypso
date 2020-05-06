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
		return parent::available() && is_user_logged_in();
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
		return $this->validate_subscriptions( $valid_plan_ids, $subscriptions );
	}

	/**
	 * Return true if any ID/date pairs are valid. Otherwise false.
	 *
	 * @param int[]        $valid_plan_ids
	 * @param array<array> $_subscriptions : ID must exist in the provided <code>$valid_subscriptions</code> parameter.
	 *                                                             The provided end date needs to be greater than <code>now()</code>.
	 *
	 * @return bool
	 */
	private function validate_subscriptions( $valid_plan_ids, $_subscriptions ) {
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
		 * @var array $_subscription
		 */
		foreach ( $_subscriptions as $_subscription ) {
			if ( in_array( (int) $_subscription['product_id'], $product_ids, true ) && strtotime( $_subscription['end_date'] ) > time() ) {
				return true;
			}
		}
		return false;
	}
}

<?php declare( strict_types = 1 );
/**
 * @package A8C\FSE\Earn
 *
 * The environment does not have a subscription service available.
 *
 * This represents this scenario.
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

use function site_url;

class Unconfigured_Subscription_Service implements Subscription_Service {

	/**
	 * Is always avaialble because it is the fallback.
	 *
	 * @return boolean
	 */
	public static function avaiable() {
		return true;
	}

	/**
	 *
	 * @return void
	 */
	function initialize() {
		// noop
	}

	/**
	 * No subscription service available, no users can see this content.
	 *
	 * @param int[] $valid_plan_ids
	 * @return boolean
	 */
	function visitor_can_view_content( $valid_plan_ids ) {
		return false;
	}

	/**
	 * The current visitor would like to obtain access. Where do they go?
	 *
	 * @param  ('subscribe'|'login') $mode
	 * @return string
	 */
	function access_url( $mode = 'subscribe' ) {
		return site_url();
	}

}

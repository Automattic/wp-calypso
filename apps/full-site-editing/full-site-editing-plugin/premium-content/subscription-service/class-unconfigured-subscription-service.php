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
	 * Is always available because it is the fallback.
	 *
	 * @inheritDoc
	 */
	public static function available() {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	function initialize() {
		// noop
	}

	/**
	 * No subscription service available, no users can see this content.
	 *
	 * @inheritDoc
	 */
	function visitor_can_view_content( $valid_plan_ids ) {
		return false;
	}

	/**
	 * The current visitor would like to obtain access. Where do they go?
	 *
	 * @inheritDoc
	 */
	function access_url( $mode = 'subscribe' ) {
		return site_url();
	}

}

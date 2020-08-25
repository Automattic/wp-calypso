<?php declare( strict_types = 1 );
/**
 * @package A8C\FSE\Earn\PremiumContent;
 *
 * The Subscription Service represents the entity responsible for making sure a visitor
 * can see blocks that are considered premium content.
 *
 * If a visitor is not allowed to see they need to be given a way gain access.
 *
 * It is assumed that it will be a monetary exchange but that is up to the host
 * that brokers the content exchange.
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

interface Subscription_Service {

	/**
	 * The subscription service can be used.
	 *
	 * @return boolean
	 */
	static function available();

	/**
	 * Allows a Subscription Service to setup anything it needs to provide its features.
	 *
	 * This is called during an `init` action hook callback.
	 *
	 * Examples of things a Service may want to do here:
	 *  - Determine a visitor is arriving with a new token to unlock content and
	 *    store the token for future browsing (e.g. in a cookie)
	 *  - Set up WP-API endpoints necessary for the function to work
	 *    - Token refreshes
	 *
	 * @return void
	 */
	function initialize();

	/**
	 * Given a token (this could be from a cookie, a querystring, or some other means)
	 * can the visitor see the premium content?
	 *
	 * @param int[] $valid_plan_ids
	 *
	 * @return boolean
	 */
	function visitor_can_view_content( $valid_plan_ids );

	/**
	 * The current visitor would like to obtain access. Where do they go?
	 *
	 * @param  ('subscribe'|'login') $mode
	 * @return string
	 */
	function access_url( $mode = 'subscribe' );
}

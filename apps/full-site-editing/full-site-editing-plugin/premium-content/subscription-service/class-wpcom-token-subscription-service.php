<?php declare( strict_types = 1 );
/**
 * @package A8C\FSE\Earn
 *
 * A paywall that exchanges JWT tokens from WordPress.com to allow
 * a current visitor to view content that has been deemed "Premium content".
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
class WPCOM_Token_Subscription_Service extends Token_Subscription_Service {

	/**
	 * @inheritDoc
	 */
	public static function available() {
     // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
		return defined( 'IS_WPCOM' ) && IS_WPCOM === true;
	}

	/**
	 * @inheritDoc
	 */
	public function get_site_id() {
		return get_current_blog_id();
	}

	/**
	 * @inheritDoc
	 */
	function get_key() {
     // phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
		return defined( 'EARN_JWT_SIGNING_KEY' ) ? EARN_JWT_SIGNING_KEY : false;
	}
}

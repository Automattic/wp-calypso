<?php declare( strict_types = 1 );

/**
 * @package A8C\FSE\Earn
 *
 * A paywall that exchanges JWT tokens from WordPress.com to allow
 * a current visitor to view content that has been deemed "Premium content".
 */
namespace A8C\FSE\Earn\PremiumContent\SubscriptionService;

use Automattic\Jetpack\Connection\Manager;

// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
class Jetpack_Token_Subscription_Service extends Token_Subscription_Service {

	/**
	 * @inheritDoc
	 */
	public static function available() {
		return class_exists( '\Jetpack_Options' );
	}

	/**
	 * @inheritDoc
	 * @throws     \Exception
	 */
	public function get_site_id() {
		return \Jetpack_Options::get_option( 'id' );
	}

	/**
	 * @inheritDoc
	 */
	function get_key() {
		$connection = new Manager();
		$token      = $connection->get_access_token();
		if ( ! isset( $token->secret ) ) {
			return false;
		}
		return $token->secret;
	}
}

<?php
/**
 * Plugin Name: Full Site Editing Development
 * Description: Overrides for Full Site Editing development.
 * Version: dev
 * Author: Automattic
 * Author URI: https://automattic.com/wordpress-plugins/
 * License: GPLv2 or later
 * Text Domain: full-site-editing
 * Author: Automattic
 * Author URI: https://automattic.com/wordpress-plugins/
 * License: GPLv2 or later
 * Text Domain: full-site-editing
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

use A8C\FSE\EarnDev\SubscriptionService\Mock_SubscriptionService;

function premium_content_dev_paywall() {
	include_once __DIR__ . '/premium-content/class-mock-subscription-service.php';
	return new Mock_SubscriptionService();
}

add_filter( 'earn_premium_content_subscription_service', __NAMESPACE__ . '\premium_content_dev_paywall' );

add_action(
	'plugins_loaded',
	function () {
		include_once __DIR__ . '/premium-content/jetpack-stubs.php';
	}
);

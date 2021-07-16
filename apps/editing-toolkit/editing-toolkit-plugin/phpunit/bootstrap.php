<?php
/**
 * PHPUnit bootstrap file
 *
 * @see https://github.com/WordPress/gutenberg/blob/HEAD/phpunit/bootstrap.php
 *
 * @package FullSiteEditing
 */

// Require composer dependencies.
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

$_tests_dir = getenv( 'WP_PHPUNIT__DIR' );

if ( ! $_tests_dir ) {
	throw new Exception( 'Could not find the WordPress test lib.' );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	update_option(
		'active_plugins',
		array(
			'editing-toolkit-plugin/full-site-editing-plugin.php',
		)
	);
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

/**
 * Adds a wp_die handler for use during tests.
 *
 * If bootstrap.php triggers wp_die, it will not cause the script to fail. This
 * means that tests will look like they passed even though they should have
 * failed. So we throw an exception if WordPress dies during test setup. This
 * way the failure is observable.
 *
 * @param string|WP_Error $message The error message.
 *
 * @throws Exception When a `wp_die()` occurs.
 */
function fail_if_died( $message ) {
	if ( is_wp_error( $message ) ) {
		$message = $message->get_error_message();
	}

	throw new Exception( 'WordPress died: ' . $message );
}
tests_add_filter( 'wp_die_handler', 'fail_if_died' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

// Use existing behavior for wp_die during actual test execution.
remove_filter( 'wp_die_handler', 'fail_if_died' );

// Don't let deprecation notices cause tests to fail.
PHPUnit\Framework\Error\Deprecated::$enabled = false;

// Global function stubs that might be needed by all tests.

/**
 * Stub for the `is_automattician` function.
 *
 * This function is only used by the `class-errorreporting-activation-test.php`
 * test at the moment. It needs to be defined here because for some reason it's
 * not loaded by default globally in the test env,and since it's when the error
 * reporting php module is loaded, and since all modules are loaded here for
 * each test, defining it globally here is needed in order to not break the
 * tests due to it being undefined.
 *
 * Check the `class-errorreporting-activation-test.php` test to make sense
 * of the implementation here.
 *
 * @param int $user_id The user id.
 */
function is_automattician( $user_id ) {
	return ( 8898 === $user_id || 8808 === $user_id );
}

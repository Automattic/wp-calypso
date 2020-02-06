<?php
/**
 * PHPUnit bootstrap file
 *
 * @package full-site-editing-plugin
 * @see https://github.com/WordPress/gutenberg/blob/master/phpunit/bootstrap.php
 *
 * Mostly copied from the Gutenberg configuration, but removed some peices that
 * are not relevant to us.
 */

// Determine the tests directory (from a WP dev checkout).
// Try the WP_TESTS_DIR environment variable first.
$_tests_dir = getenv( 'WP_TESTS_DIR' );

// See if we're installed inside an existing WP dev instance.
if ( ! $_tests_dir ) {
	$_try_tests_dir = dirname( __FILE__ ) . '/../../../../../tests/phpunit';
	if ( file_exists( $_try_tests_dir . '/includes/functions.php' ) ) {
		$_tests_dir = $_try_tests_dir;
	}
}
// Fallback.
if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
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
				'full-site-editing-plugin/full-site-editing-plugin.php',
			)
		);
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

<?php
/**
 * Server-side performance tests
 *
 * @package Gutenberg
 */

// To run these tests, set the RUN_SLOW_TESTS environment variable to a truthy
// value.
if ( getenv( 'RUN_SLOW_TESTS' ) ) {
	class Performance_Test extends WP_UnitTestCase {
		function test_parse_large_post() {
			$html = file_get_contents(
				dirname( __FILE__ ) . '/fixtures/long-content.html'
			);

			$start     = microtime( true );
			$start_mem = memory_get_usage();

			$blocks = gutenberg_parse_blocks( $html );

			$time = microtime( true ) - $start;
			$mem  = memory_get_usage() - $start_mem;

			if ( getenv( 'SHOW_PERFORMANCE_INFO' ) ) {
				error_log( '' );
				error_log( 'Memory used (KB) : ' . round( $mem / 1024 ) );
				error_log( 'Time (ms)        : ' . round( $time * 1000 ) );
			}

			$this->assertLessThanOrEqual(
				0.3, // Seconds.
				$time,
				"Parsing 'phpunit/fixtures/long-content.html' took too long."
			);
		}
	}
}

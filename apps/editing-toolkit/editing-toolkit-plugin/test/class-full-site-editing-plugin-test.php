<?php
/**
 * ETK global functions tests
 * Run:
 * cd apps/editing-toolkit
 * yarn run test:php --testsuite full-site-editing-plugin
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../full-site-editing-plugin.php';

/**
 * Class Full_Site_Editing_Test
 */
class Full_Site_Editing_Plugin_Test extends TestCase {

	/**
	 * Tests that the function calls the function to register the patterns as part of
	 * a request to the `/block_patterns/patterns` rest endpoint.
	 */
	public function test_load_block_patterns_runs_if_matches_block_patterns_rest_route() {
		add_filter( 'a8c_enable_block_patterns_api', '__return_true' );

		$block_patterns_utils_mock = $this->createMock( Block_Patterns_From_API::class );
		$block_patterns_utils_mock->expects( $this->exactly( 1 ) )
			->method( 'register_patterns' );

		$request_mock = $this->createMock( \WP_REST_Request::class );
		$request_mock->method( 'get_route' )
			->willReturn( '/wp/v2/sites/178915379/block-patterns/patterns' );

		load_block_patterns_from_api(
			function () use ( $block_patterns_utils_mock ) {
				$block_patterns_utils_mock->register_patterns();
			}
		)( null, $request_mock );
	}

	/**
	 * Tests that the function calls the function to register the patterns as part of
	 * a request to the `/block_patterns/categories` rest endpoint.
	 */
	public function test_load_block_patterns_runs_if_matches_block_patterns_categories_rest_route() {
		add_filter( 'a8c_enable_block_patterns_api', '__return_true' );

		$block_patterns_utils_mock = $this->createMock( Block_Patterns_From_API::class );
		$block_patterns_utils_mock->expects( $this->exactly( 1 ) )
			->method( 'register_patterns' );

		$request_mock = $this->createMock( \WP_REST_Request::class );
		$request_mock->method( 'get_route' )
			->willReturn( '/wp/v2/sites/178915379/block-patterns/categories' );

		load_block_patterns_from_api(
			function () use ( $block_patterns_utils_mock ) {
				$block_patterns_utils_mock->register_patterns();
			}
		)( null, $request_mock );
	}

	/**
	 * Tests that the function does not call the function to register patterns when
	 * other non-relevant requests happen.
	 */
	public function test_load_block_patterns_from_api_is_skipped_in_wrong_request_context() {
		add_filter( 'a8c_enable_block_patterns_api', '__return_true' );

		$block_patterns_utils_mock = $this->createMock( Block_Patterns_From_API::class );
		$block_patterns_utils_mock->expects( $this->never() )
			->method( 'register_patterns' );

		$other_sample_routes = array(
			'/rest/v1.1/help/olark/mine',
			'/wpcom/v2/sites/178915379/post-counts',
			'/rest/v1.1/me/shopping-cart/',
			'/wpcom/v3/sites/178915379/gutenberg',
			'/wp/v2/sites/178915379/types',
		);

		foreach ( $other_sample_routes as $route ) {
			$request_mock = $this->createMock( \WP_REST_Request::class );
			$request_mock->method( 'get_route' )
				->willReturn( $route );

			load_block_patterns_from_api(
				function () use ( $block_patterns_utils_mock ) {
					$block_patterns_utils_mock->register_patterns();
				}
			)( null, $request_mock );
		}
	}
}

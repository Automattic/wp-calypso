<?php
/**
 * Coming Soon Tests File
 * Run: yarn run test:php --testsuite block-patterns
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../class-block-patterns-from-api.php';

/**
 * Class Coming_Soon_Test
 */
class Block_Patterns_From_Api_Test extends TestCase {
	/** @var  \PHPUnit_Framework_MockObject_MockObject */
	protected $utils_mock;

	/** @var  Representation of a Pattern as returned by the API. */
	protected $pattern_mock_object;

	public function setUp() {
		parent::setUp();
		$this->pattern_mock_object = [
			'ID'            => '1',
			'site_id'       => '2',
			'title'         => 'test title',
			'name'          => 'test pattern name',
			'description'   => 'test description',
			'html'          => '<p>test</p>',
			'source_url'    => 'http;//test',
			'modified_date' => 'dd:mm:YY',
			'categories'    => [
				[
					'title' => 'test-category',
				]
			],
		];
	}

	// Returns a mock of Block_Patterns_Utils
	public function createBlockPatternsUtilsMock( $pattern_mock_response, $cache_get = false, $cache_add = true, $get_patterns_cache_key = 'key-largo', $get_block_patterns_locale = 'fr' ) {
		$mock = $this->createMock( Block_Patterns_Utils::class );

		$mock
			->method( 'remote_get' )
			->willReturn( $pattern_mock_response );

		$mock
			->method( 'cache_get' )
			->willReturn( $cache_get );

		$mock
			->method( 'cache_add' )
			->willReturn( $cache_add );

		$mock
			->method( 'get_patterns_cache_key' )
			->willReturn( $get_patterns_cache_key );

		$mock
			->method( 'get_block_patterns_locale' )
			->willReturn( $get_block_patterns_locale );

		return $mock;
	}

	public function test_patterns_request_succeeds_with_empty_cache() {
		$utils_mock              = $this->createBlockPatternsUtilsMock( [ $this->pattern_mock_object ] );
		$block_patterns_from_api = new Block_Patterns_From_API( $utils_mock );

		$utils_mock ->expects( $this->once() )
			->method( 'cache_get' )
			->willReturn( false );

		$utils_mock ->expects( $this->once() )
			->method( 'remote_get' )
			->with( 'https://public-api.wordpress.com/rest/v1/ptk/patterns/fr?tags=pattern&pattern_meta=is_web' );

		$utils_mock ->expects( $this->once() )
			->method( 'cache_add' )
			->with( $this->stringContains( 'key-largo' ), [ $this->pattern_mock_object ], 'ptk_patterns', DAY_IN_SECONDS);

		$this->assertEquals( [ 'a8c/' . $this->pattern_mock_object['name'] => true, ], $block_patterns_from_api->register_patterns() );
	}

	public function test_patterns_request_succeeds_with_set_cache() {
		$utils_mock              = $this->createBlockPatternsUtilsMock( [ $this->pattern_mock_object ], [ $this->pattern_mock_object ] );
		$block_patterns_from_api = new Block_Patterns_From_API( $utils_mock );

		$utils_mock->expects( $this->once() )
			->method( 'cache_get' )
			->with( $this->stringContains( 'key-largo' ), 'ptk_patterns' );

		$utils_mock->expects( $this->never() )
			->method( 'remote_get' );

		$utils_mock->expects( $this->never() )
			->method( 'cache_add' );

		$this->assertEquals( [ 'a8c/' . $this->pattern_mock_object['name'] => true, ], $block_patterns_from_api->register_patterns() );
	}

	public function test_patterns_request_succeeds_with_override_source_site() {
		$example_site = function() {
			return 'dotcom';
		};

		add_filter( 'a8c_override_patterns_source_site', $example_site);
		$utils_mock              = $this->createBlockPatternsUtilsMock( [ $this->pattern_mock_object ] );
		$block_patterns_from_api = new Block_Patterns_From_API( $utils_mock );

		$utils_mock->expects( $this->never() )
			->method( 'cache_get' );

		$utils_mock->expects( $this->never() )
			->method( 'cache_add' );

		$utils_mock ->expects( $this->once() )
			->method( 'remote_get' )
			->with( 'https://public-api.wordpress.com/rest/v1/ptk/patterns/fr?site=dotcom&tags=pattern&pattern_meta=is_web' );

		$this->assertEquals( [ 'a8c/' . $this->pattern_mock_object['name'] => true, ], $block_patterns_from_api->register_patterns() );

		remove_filter( 'a8c_override_patterns_source_site', $example_site );
	}
}

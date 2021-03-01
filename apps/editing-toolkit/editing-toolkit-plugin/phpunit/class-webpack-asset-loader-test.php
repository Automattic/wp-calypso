<?php
/**
 * Tests for the webpack asset loader.
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

// An asset handle we know will exist for quite a while.
const TEST_ASSET_HANDLE = 'a8c-etk-dotcom-fse';

/**
 * Webpack asset loader test.
 */
class Webpack_Asset_Loader_Test extends TestCase {
	/**
	 * Remove any styles already added by WP or other tests before doing anything.
	 */
	protected function setUp() {
		wp_dequeue_style( TEST_ASSET_HANDLE );
		wp_deregister_style( TEST_ASSET_HANDLE );
		wp_dequeue_script( TEST_ASSET_HANDLE );
		wp_deregister_script( TEST_ASSET_HANDLE );
	}

	/**
	 * Tests that both script and style assets are included.
	 * This also tests that the given asset exists on the filesystem because assets
	 * aren't included if they do not exist.
	 */
	public function testEnqueuesGivenAsset() {
		use_webpack_assets( 'dotcom-fse' );
		$script_enqueued = wp_script_is( TEST_ASSET_HANDLE, 'enqueued' );
		$this->assertTrue( $script_enqueued );
		$style_enqueued = wp_style_is( TEST_ASSET_HANDLE, 'enqueued' );
		$this->assertTrue( $style_enqueued );
	}

	/**
	 * Tests that it registers (but does not enqueue) the assets if the register_only flag is set.
	 */
	public function testRegistersOnlyIfFlagSet() {
		use_webpack_assets( 'dotcom-fse', array( 'register_only' => true ) );
		$this->assertFalse( wp_script_is( TEST_ASSET_HANDLE, 'enqueued' ) );
		$this->assertTrue( wp_script_is( TEST_ASSET_HANDLE, 'registered' ) );
		$this->assertFalse( wp_style_is( TEST_ASSET_HANDLE, 'enqueued' ) );
		$this->assertTrue( wp_style_is( TEST_ASSET_HANDLE, 'registered' ) );
	}

	/**
	 * Test that the textdomain of the script is set correctly.
	 */
	public function testSetsTranslations() {
		use_webpack_assets( 'dotcom-fse', array( 'register_only' => true ) );
		$domain = WP_Scripts()->registered[ TEST_ASSET_HANDLE ]->textdomain;
		$this->assertSame( $domain, 'full-site-editing' );
	}

	/**
	 * Tests that the style is not enqueued if the exclude_style flag is set.
	 */
	public function testExcludesStyleIfSet() {
		use_webpack_assets( 'dotcom-fse', array( 'exclude_style' => true ) );
		$this->assertTrue( wp_script_is( TEST_ASSET_HANDLE, 'enqueued' ) );
		$this->assertFalse( wp_style_is( TEST_ASSET_HANDLE, 'enqueued' ) );
	}

	/**
	 * Tests that the script is not enqueued if the exclude_script flag is set.
	 */
	public function testExcludesScriptIfSet() {
		use_webpack_assets( 'dotcom-fse', array( 'exclude_script' => true ) );
		$this->assertFalse( wp_script_is( TEST_ASSET_HANDLE, 'enqueued' ) );
		$this->assertTrue( wp_style_is( TEST_ASSET_HANDLE, 'enqueued' ) );

	}

	/**
	 * Tests that the asset handle is returned and that it matches the expected format.
	 */
	public function testReturnsAssetHandle() {
		$asset = use_webpack_assets( 'dotcom-fse' );
		$this->assertSame( $asset['asset_handle'], TEST_ASSET_HANDLE );
	}

	/**
	 * Tests that the asset directory of files is returned, and that the most
	 * specific two directories are as expected.
	 */
	public function testReturnsAssetDirectory() {
		$asset = use_webpack_assets( 'dotcom-fse' );
		$this->assertSame( basename( $asset['asset_dir_url'] ), 'dist' );
		$this->assertSame( basename( dirname( $asset['asset_dir_url'] ) ), 'editing-toolkit-plugin' );
	}
}

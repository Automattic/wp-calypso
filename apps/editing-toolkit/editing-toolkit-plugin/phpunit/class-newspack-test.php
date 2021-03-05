<?php
/**
 * Newspack Tests file.
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

/**
 * Class NewsPack_Test.
 */
class NewsPack_Test extends TestCase {

	/**
	 * Tests that required block assets are enqueued.
	 */
	public function test_carousel_assets_enqueued() {
		ob_start();
		newspack_blocks_render_block_carousel(
			array(
				'postsToShow' => 3,
			)
		);
		ob_end_flush();

		$this->assertTrue( wp_script_is( 'carousel-block-view' ) );
		$this->assertTrue( wp_style_is( 'carousel-block-view' ) );
	}

	/**
	 * Tests that required block assets are enqueued.
	 */
	public function test_blog_posts_assets_enqueued() {
		ob_start();
		newspack_blocks_render_block_homepage_articles(
			array(
				'customTextColor' => '',
				'postsToShow'     => 3,
				'showCaption'     => false,
				'showCategory'    => false,
				'showImage'       => false,
				'specificMode'    => 0,
				'textColor'       => '',
			)
		);
		ob_end_flush();

		$this->assertTrue( wp_script_is( 'blog-posts-block-view' ) );
		$this->assertTrue( wp_style_is( 'blog-posts-block-view' ) );
	}
}

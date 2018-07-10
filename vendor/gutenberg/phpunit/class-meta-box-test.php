<?php
/**
 * Test for meta box integration.
 *
 * @package Gutenberg
 */

/**
 * Tests meta box integration.
 *
 * Most of the PHP portion of the meta box integration is not testeable due to
 * WordPress's architecture. These tests cover the portions that are testable.
 */
class Meta_Box_Test extends WP_UnitTestCase {

	public function setUp() {
		parent::setUp();

		$this->meta_boxes = array(
			'post' => array(
				'normal' => array(
					'core' => array(
						'revisionsdiv'     => array(
							'id'       => 'revisionsdiv',
							'title'    => 'Revisions',
							'callback' => 'post_revisions_meta_box',
							'args'     => null,
						),
						'postexcerpt'      => array(
							'id'       => 'postexcerpt',
							'title'    => 'Excerpt',
							'callback' => 'post_excerpt_meta_box',
							'args'     => null,
						),
						'trackbacksdiv'    => array(
							'id'       => 'trackbacksdiv',
							'title'    => 'Send Trackbacks',
							'callback' => 'post_trackback_meta_box',
							'args'     => null,
						),
						'postcustom'       => array(
							'id'       => 'postcustom',
							'title'    => 'Custom Fields',
							'callback' => 'post_custom_meta_box',
							'args'     => null,
						),
						'commentstatusdiv' => array(
							'id'       => 'commentstatusdiv',
							'title'    => 'Discussion',
							'callback' => 'post_comment_status_meta_box',
							'args'     => null,
						),
						'commentsdiv'      => array(
							'id'       => 'commentsdiv',
							'title'    => 'Comments',
							'callback' => 'post_comment_meta_box',
							'args'     => null,
						),
						'slugdiv'          => array(
							'id'       => 'slugdiv',
							'title'    => 'Slug',
							'callback' => 'post_slug_meta_box',
							'args'     => null,
						),
						'authordiv'        => array(
							'id'       => 'authordiv',
							'title'    => 'Author',
							'callback' => 'post_author_meta_box',
							'args'     => null,
						),
					),
					'low'  => array(),
					'high' => array(),
				),
				'side'   => array(
					'core' => array(
						'submitdiv'        => array(
							'id'       => 'submitdiv',
							'title'    => 'Submit',
							'callback' => 'post_submit_meta_box',
							'args'     => null,
						),
						'formatdiv'        => array(
							'id'       => 'formatdiv',
							'title'    => 'Format',
							'callback' => 'post_format_meta_box',
							'args'     => null,
						),
						'categorydiv'      => array(
							'id'       => 'categorydiv',
							'title'    => 'Categories',
							'callback' => 'post_categories_meta_box',
							'args'     => null,
						),
						'tagsdiv-post_tag' => array(
							'id'       => 'tagsdiv-post_tag',
							'title'    => 'Tags',
							'callback' => 'post_tags_meta_box',
							'args'     => null,
						),
						'postimagediv'     => array(
							'id'       => 'postimagediv',
							'title'    => 'Featured Image',
							'callback' => 'post_image_meta_box',
							'args'     => null,
						),
					),
					'low'  => array(),
				),
			),
		);
	}

	/**
	 * Test filtering of meta box data.
	 */
	public function test_gutenberg_filter_meta_boxes() {
		$meta_boxes = $this->meta_boxes;
		// Add in a meta box.
		$meta_boxes['post']['normal']['high']['some-meta-box'] = array( 'meta-box-stuff' );

		$expected_meta_boxes = $this->meta_boxes;
		// We expect to remove only core meta boxes.
		$expected_meta_boxes['post']['normal']['core']                  = array();
		$expected_meta_boxes['post']['side']['core']                    = array();
		$expected_meta_boxes['post']['normal']['high']['some-meta-box'] = array( 'meta-box-stuff' );

		$actual   = gutenberg_filter_meta_boxes( $meta_boxes );
		$expected = $expected_meta_boxes;

		$this->assertEquals( $expected, $actual );
	}

	/**
	 * Test filtering back compat meta boxes
	 */
	public function test_gutenberg_filter_back_compat_meta_boxes() {
		$meta_boxes = $this->meta_boxes;

		// Add in a back compat meta box.
		$meta_boxes['post']['normal']['high']['some-meta-box'] = array(
			'id'       => 'some-meta-box',
			'title'    => 'Some Meta Box',
			'callback' => 'some_meta_box',
			'args'     => array(
				'__back_compat_meta_box' => true,
			),
		);

		// Add in a normal meta box.
		$meta_boxes['post']['normal']['high']['some-other-meta-box'] = array( 'other-meta-box-stuff' );

		$expected_meta_boxes = $this->meta_boxes;
		// We expect to remove only core meta boxes.
		$expected_meta_boxes['post']['normal']['core']                        = array();
		$expected_meta_boxes['post']['side']['core']                          = array();
		$expected_meta_boxes['post']['normal']['high']['some-other-meta-box'] = array( 'other-meta-box-stuff' );

		$actual   = gutenberg_filter_meta_boxes( $meta_boxes );
		$expected = $expected_meta_boxes;

		$this->assertEquals( $expected, $actual );
	}

	/**
	 * Test filtering of meta box data with taxonomy meta boxes.
	 *
	 * By default Gutenberg will provide a much enhanced JavaScript alternative
	 * to the meta boxes using the standard category and tags meta box callbacks.
	 */
	public function test_gutenberg_filter_meta_boxes_for_taxonomies() {
		$meta_boxes = $this->meta_boxes;
		// Add in a meta box.
		$meta_boxes['post']['normal']['high']['my-cool-tax']              = array( 'callback' => 'post_tags_meta_box' );
		$meta_boxes['post']['normal']['high']['my-cool-hierarchical-tax'] = array( 'callback' => 'post_categories_meta_box' );

		$expected_meta_boxes = $this->meta_boxes;
		// We expect to remove only core meta boxes.
		$expected_meta_boxes['post']['normal']['core'] = array();
		$expected_meta_boxes['post']['side']['core']   = array();
		// We expect the high location to be empty even though we have registered meta boxes.
		$expected_meta_boxes['post']['normal']['high'] = array();

		$actual   = gutenberg_filter_meta_boxes( $meta_boxes );
		$expected = $expected_meta_boxes;

		$this->assertEquals( $expected, $actual );
	}

	/**
	 * Test that a removed meta box remains empty after gutenberg_intercept_meta_box_render() fires.
	 */
	public function test_gutenberg_intercept_meta_box_render_skips_empty_boxes() {
		global $wp_meta_boxes;

		add_meta_box( 'test-intercept-box', 'Test Intercept box', '__return_empty_string', 'post', 'side', 'default' );
		remove_meta_box( 'test-intercept-box', 'post', 'side' );

		gutenberg_intercept_meta_box_render();

		$this->assertFalse( $wp_meta_boxes['post']['side']['default']['test-intercept-box'] );
	}
}

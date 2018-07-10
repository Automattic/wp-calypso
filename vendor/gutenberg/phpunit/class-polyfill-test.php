<?php
/**
 * Test gutenberg_get_script_polyfill()
 *
 * @package Gutenberg
 */

class Polyfill_Test extends WP_UnitTestCase {
	var $old_wp_scripts;

	function setUp() {
		parent::setUp();
		$this->old_wp_scripts = isset( $GLOBALS['wp_scripts'] ) ? $GLOBALS['wp_scripts'] : null;
		remove_action( 'wp_default_scripts', 'wp_default_scripts' );

		$GLOBALS['wp_scripts'] = new WP_Scripts();

		$GLOBALS['wp_scripts']->default_version = get_bloginfo( 'version' );

		gutenberg_register_scripts_and_styles();
	}

	public function tearDown() {
		$GLOBALS['wp_scripts'] = $this->old_wp_scripts;
		add_action( 'wp_default_scripts', 'wp_default_scripts' );
		parent::tearDown();
	}

	function test_gutenberg_get_script_polyfill_ignores_missing_handle() {
		$polyfill = gutenberg_get_script_polyfill( array(
			'\'Promise\' in window' => 'promise',
		) );

		$this->assertEquals( '', $polyfill );
	}

	function test_gutenberg_get_script_polyfill_returns_inline_script() {
		wp_register_script( 'promise', 'https://unpkg.com/promise-polyfill/promise.js' );

		$polyfill = gutenberg_get_script_polyfill( array(
			'\'Promise\' in window' => 'promise',
		) );

		$this->assertEquals(
			'( \'Promise\' in window ) || document.write( \'<script src="https://unpkg.com/promise-polyfill/promise.js"></scr\' + \'ipt>\' );',
			$polyfill
		);
	}

}

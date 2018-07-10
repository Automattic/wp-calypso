<?php
/**
 * Test gutenberg_vendor_script_filename()
 *
 * @package Gutenberg
 */

class Vendor_Script_Filename_Test extends WP_UnitTestCase {
	function vendor_script_filename_cases() {
		return array(
			// Development mode scripts.
			array(
				'react-handle',
				'https://unpkg.com/react@16.4.1/umd/react.development.js',
				'react-handle.HASH.js',
			),
			array(
				'react-dom-handle',
				'https://unpkg.com/react-dom@16.4.1/umd/react-dom.development.js',
				'react-dom-handle.HASH.js',
			),
			array(
				'tinymce-handle',
				'https://fiddle.azurewebsites.net/tinymce/nightly/tinymce.js',
				'tinymce-handle.HASH.js',
			),
			array(
				'tinymce-plugin-handle',
				'https://fiddle.azurewebsites.net/tinymce/nightly/plugins/lists/plugin.js',
				'tinymce-plugin-lists.HASH.js',
			),
			// Production mode scripts.
			array(
				'react-handle',
				'https://unpkg.com/react@16.4.1/umd/react.production.min.js',
				'react-handle.min.HASH.js',
			),
			array(
				'react-dom-handle',
				'https://unpkg.com/react-dom@16.4.1/umd/react-dom.production.min.js',
				'react-dom-handle.min.HASH.js',
			),
			array(
				'tinymce-handle',
				'https://fiddle.azurewebsites.net/tinymce/nightly/tinymce.min.js',
				'tinymce-handle.min.HASH.js',
			),
			array(
				'tinymce-plugin-handle',
				'https://fiddle.azurewebsites.net/tinymce/nightly/plugins/lists/plugin.min.js',
				'tinymce-plugin-lists.min.HASH.js',
			),
			// Other cases.
			array(
				'something-handle',
				'http://localhost/something.js?querystring',
				'something-handle.HASH.js',
			),
			array(
				'something-handle',
				'http://localhost/something.min.js?querystring',
				'something-handle.min.HASH.js',
			),
			array(
				'idkwhatthisis-handle',
				'http://localhost/idkwhatthisis',
				'idkwhatthisis-handle.HASH.js',
			),
		);
	}

	/**
	 * @dataProvider vendor_script_filename_cases
	 */
	function test_gutenberg_vendor_script_filename( $handle, $url, $expected_filename_pattern ) {
		$hash                    = substr( md5( $url ), 0, 8 );
		$actual_filename         = gutenberg_vendor_script_filename( $handle, $url );
		$actual_filename_pattern = str_replace( $hash, 'HASH', $actual_filename );
		$this->assertEquals(
			$expected_filename_pattern,
			$actual_filename_pattern,
			'Cacheable filename for ' . $url
		);
	}
}

<?php
/**
 * PEG.js parser (PHP code target) tests
 *
 * @package Gutenberg
 */

class Parsing_Test extends WP_UnitTestCase {
	protected static $fixtures_dir;

	function parsing_test_filenames() {
		self::$fixtures_dir = dirname( dirname( __FILE__ ) ) . '/core-blocks/test/fixtures';

		require_once dirname( dirname( __FILE__ ) ) . '/lib/parser.php';

		$fixture_filenames = array_merge(
			glob( self::$fixtures_dir . '/*.json' ),
			glob( self::$fixtures_dir . '/*.html' )
		);
		$fixture_filenames = array_values( array_unique( array_map(
			array( $this, 'clean_fixture_filename' ),
			$fixture_filenames
		) ) );

		return array_map(
			array( $this, 'pass_parser_fixture_filenames' ),
			$fixture_filenames
		);
	}

	function clean_fixture_filename( $filename ) {
		$filename = basename( $filename );
		$filename = preg_replace( '/\..+$/', '', $filename );
		return $filename;
	}

	function pass_parser_fixture_filenames( $filename ) {
		return array(
			"$filename.html",
			"$filename.parsed.json",
		);
	}

	function strip_r( $input ) {
		return str_replace( "\r", '', $input );
	}

	/**
	 * @dataProvider parsing_test_filenames
	 */
	function test_parser_output( $html_filename, $parsed_json_filename ) {
		$html_path        = self::$fixtures_dir . '/' . $html_filename;
		$parsed_json_path = self::$fixtures_dir . '/' . $parsed_json_filename;

		foreach ( array( $html_path, $parsed_json_path ) as $filename ) {
			if ( ! file_exists( $filename ) ) {
				throw new Exception( "Missing fixture file: '$filename'" );
			}
		}

		$html            = self::strip_r( file_get_contents( $html_path ) );
		$expected_parsed = json_decode( self::strip_r( file_get_contents( $parsed_json_path ) ), true );

		$parser = new Gutenberg_PEG_Parser;
		$result = $parser->parse( _gutenberg_utf8_split( $html ) );

		$this->assertEquals(
			$expected_parsed,
			$result,
			"File '$parsed_json_filename' does not match expected value"
		);
	}
}

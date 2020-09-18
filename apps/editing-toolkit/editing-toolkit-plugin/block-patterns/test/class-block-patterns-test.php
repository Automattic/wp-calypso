<?php
/**
 * Tests for the block-patterns plugin
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../class-block-patterns.php';

// phpcs:disable Generic.Commenting.DocComment.MissingShort,Squiz.Commenting

class Block_Patterns_Test extends TestCase {
	/**
	 * @dataProvider getPatterns
	 */
	public function test_patterns_pass_dom_validation( $name, $pattern ) {
		$prior_use_internal_errors = libxml_use_internal_errors( true );
		$dom                       = new \DOMDocument();
		$load_result               = $dom->loadHTML( $pattern['content'] );
		$errors                    = libxml_get_errors();
		libxml_clear_errors();
		libxml_use_internal_errors( $prior_use_internal_errors );

		// Overenthusiastically filter out HTML 5 tag errors
		// http://www.xmlsoft.org/html/libxml-xmlerror.html#xmlParserErrors
		// XML_HTML_UNKNOWN_TAG = 801 : 801
		$errors = array_filter(
			$errors,
			function( $error ) {
				if ( 801 !== $error->code ) {
					return true;
				};

				$html5_elements = array(
					'article',
					'aside',
					'bdi',
					'details',
					'dialog',
					'figcaption',
					'figure',
					'footer',
					'header',
					'main',
					'mark',
					'menuitem',
					'meter',
					'nav',
					'progress',
					'rp',
					'rt',
					'ruby',
					'section',
					'summary',
					'time',
					'wbr',
					// new media elements
					'audio',
					'embed',
					'source',
					'track',
					'video',
				);

				preg_match( '/Tag (.*) invalid/', $error->message, $result );
				$invalid_tag_name = $result[1] ?? 'Unknown';
				return ! in_array( $invalid_tag_name, $html5_elements, true );
			}
		);

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_var_export
		$this->assertEmpty( $errors, "Unexpected errors parsing pattern $name: " . var_export( $errors, true ) );
		$this->assertTrue( $load_result );
	}

	public function getPatterns() {
		$pattern_data = array();
		$patterns     = Block_Patterns::get_instance()->get_patterns();
		foreach ( $patterns as $name => $details ) {
			$pattern_data[] = array( $name, $details );
		}

		return $pattern_data;
	}
}

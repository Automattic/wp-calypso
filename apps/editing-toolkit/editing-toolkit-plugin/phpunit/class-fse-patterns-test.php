<?php
/**
 * Is FSE Active Tests File
 *
 * @package full-site-editing-plugin
 */

namespace A8C\FSE;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../block-patterns/class-block-patterns.php';

/**
 * Class Is_FSE_Active_Test
 */
class FSE_Patterns_Test extends TestCase {

	/**
	 * @dataProvider getPatterns
	 */
	public function test_patterns_pass_dom_validation( $name, $pattern ) {
		$this->markTestSkipped( 'TODO: filter out HTML5 tag errors' );
		// This needs the HTML5 tag errors filtered out.
		$dom         = new \DOMDocument();
		$load_result = $dom->loadHTML( $pattern['content'] );
		$errors      = libxml_get_errors();
		libxml_clear_errors();
		$this->assertEmpty( $errors );
		$this->assertTrue( $load_result );
	}

	/**
	 * @dataProvider getPatterns
	 */
	public function test_patterns_pass_gutenberg_validation( $name, $pattern ) {
		$content = $pattern['content'];
		$blocks  = parse_blocks( $content );

		// Turns out this is a no-op unless the block is dynamic
		$rerendered_blocks = join( '', array_map( 'render_block', $blocks ) );
		// So it's equivilent to this in all non-dynamic cases:
		$innerHTML = join( '', array_map( array( $this, 'recursive_inner_html' ), $blocks ) );
		$this->assertSame(
			$this->normalizeContent( $innerHTML ),
			$this->normalizeContent( $rerendered_blocks )
		);
	}

	/**
	 * @dataProvider getPatterns
	 */
	public function test_patterns_match_reserialization( $name, $pattern ) {
		$content = $pattern['content'];
		$blocks  = parse_blocks( $content );

		// Turns out the only thing that serialize_blocks() does is escape
		// some attributes
		$this->assertSame(
			$this->normalizeContent( $content ),
			$this->normalizeContent( serialize_blocks( $blocks ) )
		);
	}

	public function normalizeContent( $content ) {
		// ignore enthusiastic forward-slash escaping
		$content = preg_replace( '|\\\/|', '/', $content );

		// It can be quite hard to see differences buried in the content,
		// and as long as we apply the same transformation, comparisons should
		// still be valid
		$content = preg_replace( '/(<.*?>)/', "$1\n", $content );
		return $content;
	}

	public function getPatterns() {
		$pattern_data = array();
		$patterns     = Block_Patterns::get_instance()->get_patterns();
		foreach ( $patterns as $name => $details ) {
			// if( $name !== 'a8c/list' ) { continue; }
			$pattern_data[] = array( $name, $details );
		}

		return $pattern_data;
	}

	// This isn't quite right yet, I think
	public function recursive_inner_html( $block ) {
		$inner_block_index = 0;
		$result            = '';
		foreach ( $block['innerContent'] ?? ( is_array( $block ) ? $block : array() ) as $chunk ) {
			$result .= is_null( $chunk )
				? $this->recursive_inner_html( $block['innerBlocks'][ $inner_block_index++ ] )
				: $chunk;
		}
		return $result;
	}
}

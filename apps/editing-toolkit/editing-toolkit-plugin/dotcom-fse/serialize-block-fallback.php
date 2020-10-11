<?php
/**
 * Fallback to provide serialize_block support being added to WP 5.3.0
 *
 * @package A8C\FSE
 */

if ( ! function_exists( 'serialize_block' ) ) {
	/**
	 * Renders an HTML-serialized form of a block object
	 * from https://core.trac.wordpress.org/ticket/47375
	 *
	 * Should be available since WordPress 5.3.0.
	 *
	 * @param array $block The block being rendered.
	 * @return string The HTML-serialized form of the block
	 */
	function serialize_block( $block ) {
		// Non-block content has no block name.
		if ( null === $block['blockName'] ) {
			return $block['innerHTML'];
		}

		$unwanted = array( '--', '<', '>', '&', '\"' );
		$wanted   = array( '\u002d\u002d', '\u003c', '\u003e', '\u0026', '\u0022' );

		$name      = 0 === strpos( $block['blockName'], 'core/' ) ? substr( $block['blockName'], 5 ) : $block['blockName'];
		$has_attrs = ! empty( $block['attrs'] );
		$attrs     = $has_attrs ? str_replace( $unwanted, $wanted, wp_json_encode( $block['attrs'] ) ) : '';

		// Early abort for void blocks holding no content.
		if ( empty( $block['innerContent'] ) ) {
			return $has_attrs
				? "<!-- wp:{$name} {$attrs} /-->"
				: "<!-- wp:{$name} /-->";
		}

		$output = $has_attrs
			? "<!-- wp:{$name} {$attrs} -->\n"
			: "<!-- wp:{$name} -->\n";

		$inner_block_index = 0;
		foreach ( $block['innerContent'] as $chunk ) {
			$output .= null === $chunk
				? serialize_block( $block['innerBlocks'][ $inner_block_index++ ] )
				: $chunk;

			$output .= "\n";
		}

		$output .= "<!-- /wp:{$name} -->";

		return $output;
	}
}

if ( ! function_exists( 'serialize_blocks' ) ) {
	/**
	 * Renders an HTML-serialized form of a list of block objects
	 * from https://core.trac.wordpress.org/ticket/47375
	 *
	 * Should be available since WordPress 5.3.0.
	 *
	 * @param  array $blocks The list of parsed block objects.
	 * @return string        The HTML-serialized form of the list of blocks.
	 */
	function serialize_blocks( $blocks ) {
		return implode( "\n\n", array_map( 'serialize_block', $blocks ) );
	}
}

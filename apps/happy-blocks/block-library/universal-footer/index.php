<?php
/**
 * Block Name:  Universal Footer Navigation
 * Description: The WordPress.com footer navigation put into a block to be used everywhere.
 * Author:      Vertex
 * Text Domain: happy-blocks
 *
 * @package universal-footer
 */

/**
 * Register happy-blocks.
 */
function happyblocks_universal_footer_register() {
	register_block_type(
		__DIR__ . ( is_rtl() ? '/build/rtl' : '/build' )
	);
}

add_action( 'init', 'happyblocks_universal_footer_register' );

/**
 * Allow SVG, select and input tags in the footer.
 *
 * @param array  $tags Allowed tags, attributes, and/or entities.
 * @param string $context Context to judge allowed tags by.
 * @return array
 */
function happyblocks_universal_footer_allow_footer_tags( $tags, $context ) {
	if ( 'post' === $context ) {
		$tags['svg']            = array(
			'xmlns'       => array(),
			'fill'        => array(),
			'viewbox'     => array(),
			'role'        => array(),
			'aria-hidden' => array(),
			'focusable'   => array(),
			'class'       => array(),
		);
		$tags['path']           = array(
			'd'    => array(),
			'fill' => array(),
		);
		$tags['select']         = array(
			'class' => array(),
			'title' => array(),
		);
		$tags['option']         = array(
			'value'    => array(),
			'disabled' => array(),
			'lang'     => array(),
		);
		$tags['stop']           = array(
			'stopColor' => array(),
			'offset'    => array(),
		);
		$tags['linearGradient'] = array(
			'id' => array(),
			'x1' => array(),
			'x2' => array(),
			'y1' => array(),
			'y2' => array(),
		);
		$tags['defs']           = array();
	}
	return $tags;
}

add_filter(
	'wp_kses_allowed_html',
	'happyblocks_universal_footer_allow_svg',
	10,
	2
);

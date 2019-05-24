<?php
/**
 * Render post content block file.
 *
 * @package full-site-editing
 */

/**
 * Renders post content.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_post_content_block( $attributes, $content ) {
	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	$content = '<div class="post-content' . $align . '">'
		. __( '[Renders some content]', 'full-site-editing' )
		. '</div>';

	return $content;
}

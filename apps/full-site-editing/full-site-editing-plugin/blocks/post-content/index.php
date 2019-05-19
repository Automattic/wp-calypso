<?php

function render_post_content_block( $attributes, $content ) {
	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	$content = '<div class="post-content'. $align . '">'
		. __( '[Renders some content]' )
		. '</div>';

	return $content;
}

<?php

function render_content_preview_block( $attributes, $content ) {
	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	$content = '<div class="a8c-content'. $align . '">'
		. __( '[Renders a content]', 'jetpack' )
		. '</div>';

	return $content;
}

<?php

function render_post_content_block( $attributes, $content ) {
	$post_id = get_the_ID();
	$template_id = get_post_meta( $post_id, 'wp_template_id', true );

	// Early return to avoid the infinite loop of a template rendering itself.
	if ( $template_id === $post_id ) {
		return $content;
	}

	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	$content = '<div class="post-content'. $align . '">'
		. apply_filters( 'the_content', get_the_content() )
		. '</div>';

	return $content;
}

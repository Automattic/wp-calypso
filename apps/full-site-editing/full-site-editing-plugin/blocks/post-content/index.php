<?php

function render_post_content_block( $attributes, $content ) {
	if ( is_admin() ) {
		return $content;
	}

	$post_id = get_the_ID();
	$post_type = get_post_type();
	$template_id = get_post_meta( $post_id, 'wp_template_id', true );

	// Early return to avoid the infinite loop of a template rendering itself.
	if ( 'wp_template' === $post_type || $template_id === $post_id ) {
		return $content;
	}

	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	$content = '<div class="post-content'. $align . '">'
		. apply_filters( 'the_content', get_the_content() )
		. '</div>';

	return $content;
}

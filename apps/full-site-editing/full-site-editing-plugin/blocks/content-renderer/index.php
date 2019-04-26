<?php

function render_content_renderer_block( $attributes ) {
	if ( ! isset( $attributes['selectedPostId'] ) || ! is_int( $attributes['selectedPostId'] ) ) {
		return;
	}
	$align = $attributes['align'] ? ' align' . $attributes['selectedPostId'] : '';
	$post = get_post( $attributes['selectedPostId'] );
	setup_postdata( $post );

	$content = '<div class="a8c-content-renderer'. $align . '">'
		. apply_filters( 'the_content', get_the_content() )
		. '</div>';

	wp_reset_postdata();
	return $content;
}

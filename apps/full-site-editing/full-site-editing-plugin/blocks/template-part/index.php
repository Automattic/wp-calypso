<?php

function render_template_part_block( $attributes ) {
	if ( ! isset( $attributes['selectedPostId'] ) || ! is_int( $attributes['selectedPostId'] ) ) {
		return;
	}
	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';
	$post = get_post( $attributes['selectedPostId'] );
	setup_postdata( $post );

	$content = '<div class="a8c-template-part'. $align . '">'
		. apply_filters( 'the_content', get_the_content() )
		. '</div>';

	wp_reset_postdata();
	return $content;
}

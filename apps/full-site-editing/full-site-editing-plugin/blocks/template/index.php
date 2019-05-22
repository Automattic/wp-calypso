<?php

function render_template_block( $attributes ) {
	if ( ! isset( $attributes['templateId'] ) || ! is_int( $attributes['templateId'] ) ) {
		return;
	}
	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';
	$post = get_post( $attributes['templateId'] );
	setup_postdata( $post );

	$content = '<div class="template'. $align . '">'
		. apply_filters( 'the_content', get_the_content() )
		. '</div>';

	wp_reset_postdata();
	return $content;
}

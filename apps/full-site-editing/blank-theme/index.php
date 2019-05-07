<?php

get_header();

$post_id = get_the_ID();
$template_id = get_post_meta( $post_id, 'wp_template_id', true );
$template = get_post( $template_id );

if ( $template_id !== $post_id && $template ) {
	echo apply_filters( 'the_content', $template->post_content );
} else {
	the_content();
}

get_footer();

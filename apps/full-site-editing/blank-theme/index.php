<?php

get_header();

$template_hierarchy = json_decode( get_option( 'template_hierarchy' ) );

if ( is_singular() && have_posts() ) {
	the_post();

	$post_id = get_the_ID();
	$template_id = get_post_meta( $post_id, 'wp_template_id', true );

	if ( ! $template_id ) {
		if ( isset( $template_hierarchy->singular ) ) {
			$template_id = $template_hierarchy->singular;
		} else if ( isset( $template_hierarchy->index ) ) {
			$template_id = $template_hierarchy->index;
		}
	}

	$template = get_post( $template_id );

	if ( $template_id !== $post_id && $template ) {
		echo apply_filters( 'the_content', $template->post_content );
	} else {
		the_content();
	}
} else {
	$post_type = get_post_type();

	if ( isset( $template_hierarchy->$post_type ) ) {
		$template_id = $template_hierarchy->$post_type;
	} else if ( isset( $template_hierarchy->index ) ) {
		$template_id = $template_hierarchy->index;
	}

	$template = get_post( $template_id );

	if ( $template ) {
		echo apply_filters( 'the_content', $template->post_content );
	} else {
		while( have_posts() ) {
			the_post(); ?>
			<h2><a href="<?php the_permalink() ?>"><?php the_title(); ?></a></h2>
			<div><?php the_content(); ?></div>
		<?php }
	}
}

get_footer();

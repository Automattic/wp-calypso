<?php /* ?>

	<section id="primary" class="content-area">
		<main id="main" class="site-main">

			<?php
			while ( have_posts() ) :
				the_post();

				get_template_part( 'template-parts/content/content', 'page' );

				// If comments are open or we have at least one comment, load up the comment template.
				if ( comments_open() || get_comments_number() ) {
					comments_template();
				}

			endwhile; // End of the loop.
			?>

		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer( 'blank' );
*/ ?>
<?php

get_header( 'blank' );

if ( have_posts() ) {
	the_post();

	$post_id = get_the_ID();
	$template_id = get_post_meta( $post_id, '_wp_template_id', true );

	$template = $template_id !== $post_id ? get_post( $template_id ) : null;

	if ( isset( $template ) ) {
		echo apply_filters( 'the_content', $template->post_content );
	} else { ?>
		<div id="content" class="site-content">
			<section id="primary" class="content-area">
				<main id="main" class="site-main">
					<?php
						get_template_part( 'template-parts/content/content', 'page' );

						if ( comments_open() || get_comments_number() ) {
							comments_template();
						}
					?>
				</main><!-- #main -->
			</section><!-- #primary -->
		</div><!-- #content -->
	<?php }
}

get_footer( 'blank' );

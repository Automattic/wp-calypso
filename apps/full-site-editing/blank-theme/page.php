<?php
/**
 * Page template.
 *
 * @package full-site-editing
 */

get_header( 'blank' );
?>

	<section id="primary" class="content-area">
		<main id="main" class="site-main">

			<?php
			if ( have_posts() ) :
				the_post();

				$page_id     = get_the_ID();
				$template_id = get_post_meta( $page_id, '_wp_template_id', true );

				$template = $template_id && $template_id !== $page_id ? get_post( $template_id ) : null;

				if ( isset( $template ) ) :
					?>

						<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
							<div class="entry-content">
								<?php
									// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									echo apply_filters( 'the_content', $template->post_content );
								?>
							</div><!-- .entry-content -->
						</article><!-- #post-<?php the_ID(); ?> -->

					<?php
				else :
					get_template_part( 'template-parts/content/content', 'page' );

					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;
				endif;
			endif;
			?>

		</main><!-- #main -->
	</section><!-- #primary -->

<?php
get_footer( 'blank' );

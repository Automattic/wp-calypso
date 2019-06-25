<?php
/**
 * The Full Site Editing page template.
 *
 * @package full-site-editing
 */

?>

<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="profile" href="https://gmpg.org/xfn/11" />
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', 'twentynineteen' ); ?></a>

	<?php fse_get_header(); ?>

	<div id="content" class="site-content">

		<section id="primary" class="content-area">
			<main id="main" class="site-main">

				<?php

				/* Start the Loop */
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

	</div><!-- #content -->

	<?php fse_get_footer(); ?>

</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>

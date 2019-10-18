<?php
/**
 * Post Item.
 *
 * @package full-site-editing
 *
 * phpcs:disable WordPress.XSS.EscapeOutput.OutputNotEscaped
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
	<figure class="a8c-posts-list-item__post-thumbnail">
		<a href="<?php the_permalink(); ?>">
			<?php the_post_thumbnail( 'post-thumbnail' ); ?>
		</a>
	</figure>
	<?php endif; // has_post_thumbnail. ?>

	<?php if ( is_sticky() ) : ?>
	<div class="a8c-posts-list-item__featured">
		<span><?php esc_html_e( 'Featured', 'full-site-editing' ); ?></span>
	</div>
	<?php endif; // is_sticky. ?>

	<?php the_title( sprintf( '<h2 class="a8c-posts-list-item__title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>

	<div class="a8c-posts-list-item__meta">
		<span class="a8c-posts-list-item__datetime"><?php echo esc_html( get_the_time( get_option( 'date_format' ) ) ); ?></span>
		<span class="a8c-posts-list-item__author"><?php echo esc_html_x( 'by', 'designating the post author (eg: by John Doe', 'full-site-editing' ); ?>
			<?php the_author_posts_link(); ?>
		</span>
		<?php if ( current_user_can( 'edit_posts' ) ) : ?>	
			<span class="a8c-posts-list-item__edit-link">
				<a href="<?php echo esc_attr( get_edit_post_link() ); ?>"><?php esc_html_e( 'Edit', 'full-site-editing' ); ?></a>
			</span>
		<?php endif ?>
	</div>

	<div class="a8c-posts-list-item__excerpt">
		<?php the_excerpt(); ?>
	</div>
</article>

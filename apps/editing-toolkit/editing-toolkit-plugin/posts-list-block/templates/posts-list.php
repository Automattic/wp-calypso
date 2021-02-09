<?php
/**
 * Posts List
 *
 * @package full-site-editing
 */

/**
 * Posts list.
 *
 * @global \WP_Query $posts_list
 */
global $posts_list;

if ( $posts_list instanceof WP_Query && $posts_list->have_posts() ) :
	?>
	<div class="a8c-posts-list">
		<ul class="a8c-posts-list__listing">
			<?php
			while ( $posts_list->have_posts() ) :
				$posts_list->the_post();
				?>
				<li class="a8c-posts-list__item">
					<?php require __DIR__ . '/post-item.php'; ?>
				</li>
			<?php endwhile; ?>
		</ul>

		<a href="<?php echo esc_url( get_post_type_archive_link( 'post' ) ); ?>" class="a8c-posts-list__view-all">
			<?php esc_html_e( 'View all posts', 'full-site-editing' ); ?>
		</a>
	</div>
	<?php
else :
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo A8C\FSE\render_template( 'no-posts' );
endif;



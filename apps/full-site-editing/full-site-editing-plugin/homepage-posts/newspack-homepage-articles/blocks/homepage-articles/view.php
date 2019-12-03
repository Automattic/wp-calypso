<?php
/**
 * Server-side rendering of the `newspack-blocks/author-bio` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/author-bio` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_homepage_articles( $attributes ) {
	global $newspack_blocks_post_id;
	if ( ! $newspack_blocks_post_id ) {
		$newspack_blocks_post_id = array();
	}
	$authors        = isset( $attributes['authors'] ) ? $attributes['authors'] : array();
	$categories     = isset( $attributes['categories'] ) ? $attributes['categories'] : array();
	$tags           = isset( $attributes['tags'] ) ? $attributes['tags'] : array();
	$specific_posts = isset( $attributes['specificPosts'] ) ? $attributes['specificPosts'] : array();
	$posts_to_show  = intval( $attributes['postsToShow'] );
	$specific_mode  = intval( $attributes['specificMode'] );
	$args           = array(
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'ignore_sticky_posts' => true,
	);
	if ( $specific_mode && $specific_posts ) {
		$args['post__in'] = $specific_posts;
		$args['orderby']  = 'post__in';
	} else {
		$args['posts_per_page'] = $posts_to_show + count( $newspack_blocks_post_id );

		if ( $authors ) {
			$args['author__in'] = $authors;
		}
		if ( $categories ) {
			$args['category__in'] = $categories;
		}
		if ( $tags ) {
			$args['tag__in'] = $tags;
		}
	}
	$article_query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes, array( 'wpnbha' ) );

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( $attributes['showImage'] ) {
		$classes .= ' show-image';
	}
	if ( $attributes['showImage'] && isset( $attributes['mediaPosition'] ) ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' ts-' . $attributes['typeScale'];
	}
	if ( $attributes['showImage'] && isset( $attributes['imageScale'] ) ) {
		$classes .= ' is-' . $attributes['imageScale'];
	}
	if ( $attributes['showImage'] && $attributes['mobileStack'] ) {
		$classes .= ' mobile-stack';
	}
	if ( $attributes['showCaption'] ) {
		$classes .= ' show-caption';
	}
	if ( $attributes['showCategory'] ) {
		$classes .= ' show-category';
	}
	if ( isset( $attributes['className'] ) ) {
		$classes .= ' ' . $attributes['className'];
	}

	if ( '' !== $attributes['textColor'] || '' !== $attributes['customTextColor'] ) {
		$classes .= ' has-text-color';
	}
	if ( '' !== $attributes['textColor'] ) {
			$classes .= ' has-' . $attributes['textColor'] . '-color';
	}

	$styles = '';

	if ( '' !== $attributes['customTextColor'] ) {
		$styles = 'color: ' . $attributes['customTextColor'] . ';';
	}

	$post_counter = 0;

	ob_start();

	if ( $article_query->have_posts() ) :
		?>
		<div class="<?php echo esc_attr( $classes ); ?>" style="<?php echo esc_attr( $styles ); ?>">

			<?php if ( '' !== $attributes['sectionHeader'] ) : ?>
				<h2 class="article-section-title">
					<span><?php echo wp_kses_post( $attributes['sectionHeader'] ); ?></span>
				</h2>
				<?php
			endif;
			while ( $article_query->have_posts() ) :
				$article_query->the_post();
				if ( ! $attributes['specificMode'] && ( isset( $newspack_blocks_post_id[ get_the_ID() ] ) || $post_counter >= $posts_to_show ) ) {
					continue;
				}
				$newspack_blocks_post_id[ get_the_ID() ] = true;

				$authors = newspack_blocks_prepare_authors();

				$post_counter++;

				$styles = '';
				if ( 'behind' === $attributes['mediaPosition'] && $attributes['showImage'] && has_post_thumbnail() ) {
					$styles = 'min-height: ' . $attributes['minHeight'] . 'vh; padding-top: ' . ( $attributes['minHeight'] / 5 ) . 'vh;';
				}
				?>

				<article <?php echo has_post_thumbnail() ? 'class="post-has-image"' : ''; ?> <?php echo $styles ? 'style="' . esc_attr( $styles ) . '"' : ''; ?>>

					<?php if ( has_post_thumbnail() && $attributes['showImage'] && $attributes['imageShape'] ) : ?>

						<figure class="post-thumbnail">
							<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
								<?php
								$image_size = 'newspack-article-block-uncropped';
								if ( 'uncropped' !== $attributes['imageShape'] ) {
									$image_size = Newspack_Blocks::image_size_for_orientation( $attributes['imageShape'] );
								}

								// If the image position is behind, pass the object-fit setting to maintain styles with AMP.
								if ( 'behind' === $attributes['mediaPosition'] ) {
									the_post_thumbnail(
										$image_size,
										array(
											'object-fit' => 'cover',
										)
									);
								} else {
									the_post_thumbnail( $image_size );
								}
								?>
							</a>

							<?php if ( $attributes['showCaption'] && '' !== get_the_post_thumbnail_caption() ) : ?>
								<figcaption><?php the_post_thumbnail_caption(); ?>
							<?php endif; ?>
						</figure><!-- .featured-image -->
					<?php endif; ?>

					<div class="entry-wrapper">

						<?php
						if ( $attributes['showCategory'] ) :
							$category = false;

							// Use Yoast primary category if set.
							if ( class_exists( 'WPSEO_Primary_Term' ) ) {
								$primary_term = new WPSEO_Primary_Term( 'category', get_the_ID() );
								$category_id  = $primary_term->get_primary_term();
								if ( $category_id ) {
									$category = get_term( $category_id );
								}
							}

							if ( ! $category ) {
								$categories_list = get_the_category();
								if ( ! empty( $categories_list ) ) {
									$category = $categories_list[0];
								}
							}

							if ( $category ) :
								?>
								<div class='cat-links'>
									<a href="<?php echo esc_url( get_category_link( $category->term_id ) ); ?>">
										<?php echo esc_html( $category->name ); ?>
									</a>
								</div>
								<?php
							endif;
						endif;
						?>

						<?php
						if ( '' === $attributes['sectionHeader'] ) {
							the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
						} else {
							the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' );
						}
						?>

						<?php if ( $attributes['showExcerpt'] ) : ?>
							<?php the_excerpt(); ?>
						<?php endif; ?>

						<?php if ( $attributes['showAuthor'] || $attributes['showDate'] ) : ?>

							<div class="entry-meta">

								<?php
								if ( $attributes['showAuthor'] && $attributes['showAvatar'] ) :
									echo wp_kses_post( newspack_blocks_format_avatars( $authors ) );
								endif;

								if ( $attributes['showAuthor'] ) :
									?>
									<span class="byline">
										<?php echo wp_kses_post( newspack_blocks_format_byline( $authors ) ); ?>
									</span><!-- .author-name -->
									<?php
								endif;

								if ( $attributes['showDate'] ) {
									$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

									if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
										$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
									}

									$time_string = sprintf(
										$time_string,
										esc_attr( get_the_date( DATE_W3C ) ),
										esc_html( get_the_date() ),
										esc_attr( get_the_modified_date( DATE_W3C ) ),
										esc_html( get_the_modified_date() )
									);

									echo $time_string; // WPCS: XSS OK.
								}
								?>
							</div><!-- .entry-meta -->
						<?php endif; ?>
					</div><!-- .entry-wrapper -->
				</article>
				<?php
			endwhile;
			?>
			<?php wp_reset_postdata(); ?>
		</div>
		<?php
		endif;
	$content = ob_get_clean();
	Newspack_Blocks::enqueue_view_assets( 'homepage-articles' );
	return $content;
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
function newspack_blocks_register_homepage_articles() {
	$name = 'newspack-blocks/homepage-articles';
	register_block_type(
		apply_filters( 'newspack_blocks_block_name', $name ),
		apply_filters(
			'newspack_blocks_block_args',
			array(
				'attributes'      => array(
					'className'       => array(
						'type' => 'string',
					),
					'showExcerpt'     => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showDate'        => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showImage'       => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showCaption'     => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'showAuthor'      => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showAvatar'      => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'showCategory'    => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'content'         => array(
						'type' => 'string',
					),
					'postLayout'      => array(
						'type'    => 'string',
						'default' => 'list',
					),
					'columns'         => array(
						'type'    => 'integer',
						'default' => 3,
					),
					'postsToShow'     => array(
						'type'    => 'integer',
						'default' => 3,
					),
					'mediaPosition'   => array(
						'type'    => 'string',
						'default' => 'top',
					),
					'authors'         => array(
						'type'    => 'array',
						'default' => array(),
						'items'   => array(
							'type' => 'integer',
						),
					),
					'categories'      => array(
						'type'    => 'array',
						'default' => array(),
						'items'   => array(
							'type' => 'integer',
						),
					),
					'tags'            => array(
						'type'    => 'array',
						'default' => array(),
						'items'   => array(
							'type' => 'integer',
						),
					),
					'specificPosts'   => array(
						'type'    => 'array',
						'default' => array(),
						'items'   => array(
							'type' => 'integer',
						),
					),
					'typeScale'       => array(
						'type'    => 'integer',
						'default' => 4,
					),
					'imageScale'      => array(
						'type'    => 'integer',
						'default' => 3,
					),
					'mobileStack'     => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'imageShape'      => array(
						'type'    => 'string',
						'default' => 'landscape',
					),
					'minHeight'       => array(
						'type'    => 'integer',
						'default' => 0,
					),
					'sectionHeader'   => array(
						'type'    => 'string',
						'default' => '',
					),
					'specificMode'    => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'textColor'       => array(
						'type'    => 'string',
						'default' => '',
					),
					'customTextColor' => array(
						'type'    => 'string',
						'default' => '',
					),
				),
				'render_callback' => 'newspack_blocks_render_block_homepage_articles',
			),
			$name
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );

/**
 * Prepare an array of authors, taking presence of CoAuthors Plus into account.
 *
 * @return array Array of WP_User objects.
 */
function newspack_blocks_prepare_authors() {
	if ( function_exists( 'coauthors_posts_links' ) ) {
		$authors = get_coauthors();
		foreach ( $authors as $author ) {
			// Check if this is a guest author post type.
			if ( 'guest-author' === get_post_type( $author->ID ) ) {
				// If yes, make sure the author actually has an avatar set; otherwise, coauthors_get_avatar returns a featured image.
				if ( get_post_thumbnail_id( $author->ID ) ) {
					$author->avatar = coauthors_get_avatar( $author, 48 );
				} else {
					// If there is no avatar, force it to return the current fallback image.
					$author->avatar = get_avatar( ' ' );
				}
			} else {
				$author->avatar = coauthors_get_avatar( $author, 48 );
			}
			$author->url = get_author_posts_url( $author->ID, $author->user_nicename );
		}
		return $authors;
	}
	$id = get_the_author_meta( 'ID' );
	return array(
		(object) array(
			'ID'            => $id,
			'avatar'        => get_avatar( $id, 48 ),
			'url'           => get_author_posts_url( $id ),
			'user_nicename' => get_the_author(),
			'display_name'  => get_the_author_meta( 'display_name' ),
		),
	);
}

/**
 * Renders author avatar markup.
 *
 * @param array $author_info Author info array.
 *
 * @return string Returns formatted Avatar markup
 */
function newspack_blocks_format_avatars( $author_info ) {
	$elements = array_map(
		function( $author ) {
			return sprintf( '<a href="%s">%s</a>', $author->url, $author->avatar );
		},
		$author_info
	);
	return implode( '', $elements );
}
/**
 * Renders byline markup.
 *
 * @param array $author_info Author info array.
 *
 * @return string Returns byline markup.
 */
function newspack_blocks_format_byline( $author_info ) {
	$index    = -1;
	$elements = array_merge(
		array(
			esc_html_x( 'by', 'post author', 'newspack-blocks' ) . ' ',
		),
		array_reduce(
			$author_info,
			function( $accumulator, $author ) use ( $author_info, &$index ) {
				$index ++;
				$penultimate = count( $author_info ) - 2;
				return array_merge(
					$accumulator,
					array(
						sprintf(
							/* translators: 1: author link. 2: author name. 3. variable seperator (comma, 'and', or empty) */
							'<span class="author vcard"><a class="url fn n" href="%1$s">%2$s</a></span>',
							esc_url( get_author_posts_url( $author->ID, $author->user_nicename ) ),
							esc_html( $author->display_name )
						),
						( $index < $penultimate ) ? ', ' : '',
						( count( $author_info ) > 1 && $penultimate === $index ) ? esc_html_x( ' and ', 'post author', 'newspack-blocks' ) : '',
					)
				);
			},
			array()
		)
	);
	return implode( '', $elements );
}

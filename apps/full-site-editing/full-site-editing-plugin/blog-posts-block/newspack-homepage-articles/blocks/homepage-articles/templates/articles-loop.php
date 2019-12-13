<?php
/**
 * Articles loop template.
 *
 * @package WordPress
 * @global \WP_Query $article_query Article query.
 * @global array     $attributes
 * @global array     $newspack_blocks_post_id
 */

call_user_func(
	function( $data ) {
		$attributes    = $data['attributes'];
		$article_query = $data['article_query'];
		global $newspack_blocks_post_id;
		$post_counter = 0;
		while ( $article_query->have_posts() ) {
			$article_query->the_post();
			if ( ! $attributes['specificMode'] && ( isset( $newspack_blocks_post_id[ get_the_ID() ] ) || $post_counter >= $attributes['postsToShow'] ) ) {
				continue;
			}
			$newspack_blocks_post_id[ get_the_ID() ] = true;
			$post_counter++;
			echo Newspack_Blocks::template_inc( __DIR__ . '/article.php', array( 'attributes' => $attributes ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		wp_reset_postdata();
	},
	$data // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UndefinedVariable
);

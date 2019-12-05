<?php
/**
 * Register Newspack Blocks rest fields
 *
 * @package Newspack_Blocks
 */

/**
 * `Newspack_Blocks_API` is a wrapper for `register_rest_fields()`
 */
class Newspack_Blocks_API {

	/**
	 * Register Newspack REST fields.
	 */
	public static function register_rest_fields() {
		register_rest_field(
			array( 'post', 'page' ),
			'newspack_featured_image_src',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_image_src' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		register_rest_field(
			array( 'post', 'page' ),
			'newspack_featured_image_caption',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_image_caption' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		/* Add author info source */
		register_rest_field(
			'post',
			'newspack_author_info',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_author_info' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		/* Add first category source */
		register_rest_field(
			'post',
			'newspack_category_info',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_primary_category' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	/**
	 * Get thumbnail featured image source for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_image_src( $object ) {
		if ( 0 === $object['featured_media'] ) {
			return;
		}

		// Landscape image.
		$landscape_size = Newspack_Blocks::image_size_for_orientation( 'landscape' );

		$feat_img_array_landscape        = wp_get_attachment_image_src(
			$object['featured_media'],
			$landscape_size,
			false
		);
		$featured_image_set['landscape'] = $feat_img_array_landscape[0];

		// Portrait image.
		$portrait_size = Newspack_Blocks::image_size_for_orientation( 'portrait' );

		$feat_img_array_portrait        = wp_get_attachment_image_src(
			$object['featured_media'],
			$portrait_size,
			false
		);
		$featured_image_set['portrait'] = $feat_img_array_portrait[0];

		// Square image.
		$square_size = Newspack_Blocks::image_size_for_orientation( 'square' );

		$feat_img_array_square        = wp_get_attachment_image_src(
			$object['featured_media'],
			$square_size,
			false
		);
		$featured_image_set['square'] = $feat_img_array_square[0];

		// Uncropped image.
		$uncropped_size = 'newspack-article-block-uncropped';

		$feat_img_array_uncropped        = wp_get_attachment_image_src(
			$object['featured_media'],
			$uncropped_size,
			false
		);
		$featured_image_set['uncropped'] = $feat_img_array_uncropped[0];

		return $featured_image_set;
	}

	/**
	 * Get thumbnail featured image captions for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_image_caption( $object ) {
		return (int) $object['featured_media'] > 0 ? trim( wp_get_attachment_caption( $object['featured_media'] ) ) : null;
	}

	/**
	 * Get author info for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_author_info( $object ) {

		if ( function_exists( 'coauthors_posts_links' ) ) :
			$authors = get_coauthors();

			foreach ( $authors as $author ) {
				// Check if this is a guest author post type.
				if ( 'guest-author' === get_post_type( $author->ID ) ) {
					// If yes, make sure the author actually has an avatar set; otherwise, coauthors_get_avatar returns a featured image.
					if ( get_post_thumbnail_id( $author->ID ) ) {
						$author_avatar = coauthors_get_avatar( $author, 48 );
					} else {
						// If there is no avatar, force it to return the current fallback image.
						$author_avatar = get_avatar( ' ' );
					}
				} else {
					$author_avatar = coauthors_get_avatar( $author, 48 );
				}
				$author_data[] = array(
					/* Get the author name */
					'display_name' => esc_html( $author->display_name ),
					/* Get the author avatar */
					'avatar'       => wp_kses_post( $author_avatar ),
				);
			}
		else :
			$author_data[] = array(
				/* Get the author name */
				'display_name' => get_the_author_meta( 'display_name', $object['author'] ),
				/* Get the author avatar */
				'avatar'       => get_avatar( $object['author'], 48 ),
			);
		endif;

		/* Return the author data */
		return $author_data;
	}

	/**
	 * Get primary category for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_primary_category( $object ) {
		$category = false;

		// Use Yoast primary category if set.
		if ( class_exists( 'WPSEO_Primary_Term' ) ) {
			$primary_term = new WPSEO_Primary_Term( 'category', $object['id'] );
			$category_id = $primary_term->get_primary_term();
			if ( $category_id ) {
				$category = get_term( $category_id );
			}
		}

		if ( ! $category ) {
			$categories_list = get_the_category( $object['id'] );
			if ( ! empty( $categories_list ) ) {
				$category = $categories_list[0];
			}
		}

		if ( ! $category ) {
			return '';
		}

		return $category->name;
	}
}

add_action( 'rest_api_init', array( 'Newspack_Blocks_API', 'register_rest_fields' ) );

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
			[ 'post', 'page' ],
			'newspack_featured_image_src',
			[
				'get_callback' => [ 'Newspack_Blocks_API', 'newspack_blocks_get_image_src' ],
				'schema'       => [
					'context' => [
						'edit',
					],
					'type'    => 'array',
				],
			]
		);

		register_rest_field(
			[ 'post', 'page' ],
			'newspack_featured_image_caption',
			[
				'get_callback' => [ 'Newspack_Blocks_API', 'newspack_blocks_get_image_caption' ],
				'schema'       => [
					'context' => [
						'edit',
					],
					'type'    => 'string',
				],
			]
		);

		/* Add author info source */
		register_rest_field(
			'post',
			'newspack_author_info',
			[
				'get_callback' => [ 'Newspack_Blocks_API', 'newspack_blocks_get_author_info' ],
				'schema'       => [
					'context' => [
						'edit',
					],
					'type'    => 'array',
				],
			]
		);

		/* Add first category source */
		register_rest_field(
			'post',
			'newspack_category_info',
			[
				'get_callback' => [ 'Newspack_Blocks_API', 'newspack_blocks_get_primary_category' ],
				'schema'       => [
					'context' => [
						'edit',
					],
					'type'    => 'string',
				],
			]
		);

		/* Add list of categories for CSS classes */
		register_rest_field(
			'post',
			'newspack_article_classes',
			[
				'get_callback' => [ 'Newspack_Blocks_API', 'newspack_blocks_get_cat_tag_classes' ],
				'schema'       => [
					'context' => [
						'edit',
					],
					'type'    => 'string',
				],
			]
		);
	}

	/**
	 * Get thumbnail featured image source for the rest field.
	 *
	 * @param array $object The object info.
	 * @return array | bool Featured image if available, false if not.
	 */
	public static function newspack_blocks_get_image_src( $object ) {
		$featured_image_set = [];

		if ( 0 === $object['featured_media'] ) {
			return false;
		}

		// Large image.
		$feat_img_array_large        = wp_get_attachment_image_src(
			$object['featured_media'],
			'large',
			false
		);
		$featured_image_set['large'] = $feat_img_array_large[0];

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
	 * @param array $object The object info.
	 * @return string|null Image caption on success, null on failure.
	 */
	public static function newspack_blocks_get_image_caption( $object ) {
		return (int) $object['featured_media'] > 0 ? trim( wp_get_attachment_caption( $object['featured_media'] ) ) : null;
	}

	/**
	 * Get author info for the rest field.
	 *
	 * @param array $object The object info.
	 * @return array Author data.
	 */
	public static function newspack_blocks_get_author_info( $object ) {
		$author_data = [];

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
				$author_link = null;
				if ( function_exists( 'coauthors_posts_links' ) ) {
					$author_link = get_author_posts_url( $author->ID, $author->user_nicename );
				}
				$author_data[] = array(
					/* Get the author name */
					'display_name' => esc_html( $author->display_name ),
					/* Get the author avatar */
					'avatar'       => wp_kses_post( $author_avatar ),
					/* Get the author ID */
					'id'           => $author->ID,
					/* Get the author Link */
					'author_link'  => $author_link,
				);
			}
		else :
			$author_data[] = array(
				/* Get the author name */
				'display_name' => get_the_author_meta( 'display_name', $object['author'] ),
				/* Get the author avatar */
				'avatar'       => get_avatar( $object['author'], 48 ),
				/* Get the author ID */
				'id'           => $object['author'],
				/* Get the author Link */
				'author_link'  => get_author_posts_url( $object['author'] ),
			);
		endif;

		/* Return the author data */
		return $author_data;
	}

	/**
	 * Get primary category for the rest field.
	 *
	 * @param array $object The object info.
	 * @return string Category name.
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

	/**
	 * Get a list of category, tag classes for the rest field.
	 *
	 * @param array $object The object info.
	 * @return string classes from assigned categories and tags.
	 */
	public static function newspack_blocks_get_cat_tag_classes( $object ) {
		return Newspack_Blocks::get_term_classes( $object['id'] );
	}

	/**
	 * Register the video-playlist endpoint.
	 */
	public static function register_video_playlist_endpoint() {
		register_rest_route(
			'newspack-blocks/v1',
			'/video-playlist',
			[
				'methods'  => 'GET',
				'callback' => [ 'Newspack_Blocks_API', 'video_playlist_endpoint' ],
			]
		);
	}

	/**
	 * Process requests to the video-playlist endpoint.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response.
	 */
	public static function video_playlist_endpoint( $request ) {
		$args = $request->get_params();
		return new \WP_REST_Response( newspack_blocks_get_video_playlist( $args ), 200 );
	}

	/**
	 * Adds meta query support to API rest endpoint.
	 *
	 * @param array           $args    Key value array of query var to query value.
	 * @param WP_REST_Request $request The request used.
	 * @return array          $args    Filtered request parameters.
	 */
	public static function post_meta_request_params( $args, $request ) {
		$params = $request->get_params();

		if (
			isset( $params['meta_key'], $params['meta_value_num'], $params['meta_compare'] ) &&
			'_thumbnail_id' === $params['meta_key'] &&
			'0' === $params['meta_value_num'] &&
			'>' === $params['meta_compare']
		) {
			// phpcs:disable WordPress.DB.SlowDBQuery
			$args['meta_key']       = $params['meta_key'];
			$args['meta_value_num'] = $params['meta_value_num'];
			$args['meta_compare']   = $params['meta_compare'];
			// phpcs:enable WordPress.DB.SlowDBQuery
		}

		return $args;
	}
}

add_action( 'rest_api_init', array( 'Newspack_Blocks_API', 'register_rest_fields' ) );
add_action( 'rest_api_init', array( 'Newspack_Blocks_API', 'register_video_playlist_endpoint' ) );
add_filter( 'rest_post_query', array( 'Newspack_Blocks_API', 'post_meta_request_params' ), 10, 2 );

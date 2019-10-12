<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WP_Template_Inserter
 */
class Template_Image_Inserter {
	/**
	 * Upload any images passed in params into the media library.
	 * At the same time, check if created post content contains the URL so we can
	 * replace the URL with the user's blog's uploaded image URL.
	 *
	 * @param array $urls  URLs of images from the annotation files.
	 * @param array $posts An array of posts to update with new images.
	 */
	public function copy_images_and_update_posts( $urls = [], $posts = [] ) {
		if ( empty( $urls ) || empty( $created_posts ) ) {
			return;
		}

		$images = upload_images( $urls );
		foreach ( $posts as $post ) {
			update_post_images( $post, $images );
		}
	}

	/**
	 * Upload an array of images to the media library.
	 *
	 * @param array $image_urls Images URLs to upload.
	 * @return array Each entry contains the old and new URL of the image.
	 */
	public function upload_images( $image_urls ) {
		return array_reduce(
			$image_urls,
			function( $total, $url ) {
				$local_url = $this->upload_image( $url );
				if ( $local_url ) {
					$total[] = [
						'old_url' => $url,
						'new_url' => $local_url,
					];
				} else {
					do_action(
						'a8c_fse_log',
						'image_sideload_failure',
						[
							'context'   => 'Template_Image_Inserter->upload_images',
							'error'     => 'Issue uploading the image',
							'image_url' => $url,
						]
					);
				}
				return $total;
			},
			[]
		);
	}

	/**
	 * Upload an image URL.
	 *
	 * @param string $image_url The URL to download then upload.
	 * @return string|WP_Error  The local URL of the uploaded image.
	 */
	public function upload_image( $image_url ) {
		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			require_once ABSPATH . '/wp-admin/includes/media.php';
			require_once ABSPATH . '/wp-admin/includes/image.php';
		}

		$file_name = basename( wp_parse_url( $image_url, PHP_URL_PATH ) );
		$tmp       = download_url( $image_url );

		$desc       = 'Placeholder Image';
		$file_array = array(
			'name'     => $file_name,
			'tmp_name' => $tmp,
		);

		if ( is_wp_error( $tmp ) ) {
			return;
		}

		$id = media_handle_sideload( $file_array, 0, $desc );

		if ( is_wp_error( $id ) ) {
			return;
		}

		return wp_get_attachment_url( $id );
	}

	/**
	 * Upload an image URL.
	 *
	 * @param array $post   The post which should be updated with the new URLs.
	 * @param array $images An array of old/new image URLs to replace.
	 */
	public function update_post_images( $post, $images ) {
		$content = $post->post_content;
		foreach ( $images as $image ) {
			$content = str_replace( $image['old_url'], $image['new_url'], $content );
		}

		$res = wp_update_post(
			[
				'ID'           => $post->ID,
				'post_content' => $content,
			]
		);

		if ( ! $res ) {
			do_action(
				'a8c_fse_log',
				'update_post_with_new_image',
				[
					'context' => 'Template_Image_Inserter->update_post_images',
					'error'   => 'Issue updating the post with the new image URLs.',
				]
			);
		}
	}
}

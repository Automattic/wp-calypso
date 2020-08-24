<?php
/**
 * Full site editing file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Template_Image_Inserter
 */
class Template_Image_Inserter {
	/**
	 * Uploads specific images to the media libraray
	 *
	 * It then checks if any of the passed image URLs are also in the post content
	 * of any of the passed post IDs. If so, then the post content is updated to
	 * use the new local URL instead of the passed URL.
	 *
	 * @param array $img_urls URLs of images which should be uploaded.
	 * @param array $post_ids An array of posts IDs which should be updated with newly uploaded image URLs.
	 */
	public function copy_images_and_update_posts( $img_urls = array(), $post_ids = array() ) {
		do_action(
			'a8c_fse_log',
			'template_image_sideload_begin',
			array(
				'context'    => 'Template_Image_Inserter->copy_images_and_update_posts',
				'image_urls' => $img_urls,
			)
		);

		if ( empty( $img_urls ) || empty( $post_ids ) ) {
			return;
		}

		$images = $this->upload_images( $img_urls );
		foreach ( $post_ids as $id ) {
			$this->update_post_images( $id, $images );
		}
	}

	/**
	 * Upload an array of images to the media library.
	 *
	 * If an file fails to upload, the error is logged to the FSE error handler.
	 *
	 * @param  array $image_urls Images URLs to upload.
	 * @return array Each entry contains the old and new URL of an image if successfully uploaded.
	 */
	public function upload_images( $image_urls ) {
		return array_reduce(
			$image_urls,
			function( $accumulator, $url ) {
				// 1. Attempt to sideload the image and get the local URL.
				$local_url = $this->upload_image( $url );

				// 2. Check if anything went wrong during upload.
				$error_msg = null;
				if ( is_wp_error( $local_url ) ) {
					$error_msg = $local_url->get_error_message();
				} elseif ( ! is_string( $local_url ) ) {
					$error_msg = 'Issue uploading the image.';
				}

				// 3. If there was an error, report it.
				if ( is_string( $error_msg ) ) {
					do_action(
						'a8c_fse_log',
						'image_sideload_failure',
						array(
							'context'          => 'Template_Image_Inserter->upload_images',
							'error'            => $error_msg,
							'remote_image_url' => $url,
						)
					);
				} else {
					// 4. Otherwise, save the url.
					$accumulator[] = array(
						'old_url' => $url,
						'new_url' => $local_url,
					);
				}
				return $accumulator;
			},
			array()
		);
	}

	/**
	 * Sideload a remote image URL and return the local attachment URL.
	 *
	 * @param  string $image_url The URL to sideload to the local site.
	 * @return string The local URL of the newly uploaded image.
	 */
	public function upload_image( $image_url ) {
		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			require_once ABSPATH . '/wp-admin/includes/media.php';
			require_once ABSPATH . '/wp-admin/includes/image.php';
		}

		// 1. Download the image.
		$local_file = download_url( $image_url );
		if ( is_wp_error( $local_file ) ) {
			return $local_file;
		}

		// 2. Create a file object.
		$file_name  = basename( wp_parse_url( $image_url, PHP_URL_PATH ) );
		$desc       = 'Template Part Image';
		$file_array = array(
			'name'     => $file_name,
			'tmp_name' => $local_file,
		);

		// 3. Sideload, remove tmp file, and return the local URL.
		$id = media_handle_sideload( $file_array, 0, $desc );
		// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		@unlink( $local_file );

		if ( is_wp_error( $id ) ) {
			return $id;
		}

		return wp_get_attachment_url( $id );
	}

	/**
	 * Upload an image URL.
	 *
	 * @param  array $post_id The post ID which should be updated with the new URLs.
	 * @param  array $images  An array of old/new image URLs to replace.
	 */
	public function update_post_images( $post_id, $images ) {
		$content = get_post_field( 'post_content', $post_id );
		if ( empty( $content ) ) {
			do_action(
				'a8c_fse_log',
				'update_post_with_new_images_get_post_failure',
				array(
					'context' => 'Template_Image_Inserter->update_post_images',
					'error'   => 'Could not retrieve post content.',
					'post_id' => $post_id,
				)
			);
			return;
		}

		// Replace the matching images in the content and update the post.
		foreach ( $images as $image ) {
			$content = str_replace( $image['old_url'], $image['new_url'], $content );
		}
		$res = wp_update_post(
			array(
				'ID'           => $post_id,
				'post_content' => $content,
			)
		);

		if ( ! $res ) {
			do_action(
				'a8c_fse_log',
				'update_post_with_new_images_update_post_failure',
				array(
					'context'    => 'Template_Image_Inserter->update_post_images',
					'error'      => 'Issue updating the post with the new image URLs.',
					'image_urls' => $images,
				)
			);
		}
	}
}

<?php
/**
 * Block Patterns Utils.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Patterns_Utils
 */
class Block_Patterns_Utils {
	/**
	 * Make remote get requests.
	 *
	 * @param string $request_url The request URL.
	 * @return array              The response.
	 */
	public function remote_get( $request_url ) {
		$args = array( 'timeout' => 20 );

		if ( function_exists( 'wpcom_json_api_get' ) ) {
			$response = wpcom_json_api_get( $request_url, $args );
		} else {
			$response = wp_remote_get( $request_url, $args );
		}

		if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}
		return json_decode( wp_remote_retrieve_body( $response ), true );
	}

	/**
	 * A wrapper for wp_cache_add.
	 *
	 * @param  int|string $key    The cache key to use for retrieval later.
	 * @param  mixed      $data   The data to add to the cache.
	 * @param  string     $group  The group to add the cache to. Enables the same key to be used across groups. Default empty.
	 * @param  int        $expire When the cache data should expire, in seconds.
	 *                            Default 0 (no expiration).
	 * @return bool               True on success, false if cache key and group already exist.
	 */
	public function cache_add( $key, $data, $group, $expire ) {
		return wp_cache_add( $key, $data, $group, $expire );
	}

	/**
	 * A wrapper for wp_cache_get.
	 *
	 * @param int|string $key   The key under which the cache contents are stored.
	 * @param string     $group Where the cache contents are grouped. Default empty.
	 * @return mixed|false      The cache contents on success, false on failure to retrieve contents.
	 */
	public function cache_get( $key, $group ) {
		return wp_cache_get( $key, $group );
	}

	/**
	 * Returns the sha1 hash of a concatenated string to use as a cache key.
	 *
	 * @param string $patterns_slug A slug for a patterns source site, e.g., `block_patterns`.
	 * @return string locale slug
	 */
	public function get_patterns_cache_key( $patterns_slug ) {
		return sha1(
			implode(
				'_',
				array(
					$patterns_slug,
					A8C_ETK_PLUGIN_VERSION,
					$this->get_block_patterns_locale(),
				)
			)
		);
	}

	/**
	 * Get the locale to be used for fetching block patterns
	 *
	 * @return string locale slug
	 */
	public function get_block_patterns_locale() {
		// Make sure to get blog locale, not user locale.
		$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
		return \A8C\FSE\Common\get_iso_639_locale( $language );
	}

	/**
	 * Check for block type values in the pattern_meta tag.
	 * When tags have a prefix of `block_type_`, we expect the remaining suffix to be a blockType value.
	 * We'll add these values to the `(array) blockType` options property when registering the pattern
	 * via `register_block_pattern`.
	 *
	 * @param array $pattern A pattern with a 'pattern_meta' array.
	 *
	 * @return array         An array of block types defined in pattern meta.
	 */
	public function maybe_get_pattern_block_types_from_pattern_meta( $pattern ) {
		$block_types = array();

		if ( ! isset( $pattern['pattern_meta'] ) || empty( $pattern['pattern_meta'] ) ) {
			return $block_types;
		}

		foreach ( $pattern['pattern_meta'] as $pattern_meta => $value ) {
			// Match against tags starting with `block_type_`.
			$split_slug = preg_split( '/^block_type_/', $pattern_meta );

			if ( isset( $split_slug[1] ) ) {
				$block_types[] = $split_slug[1];
			}
		}

		return $block_types;
	}
}

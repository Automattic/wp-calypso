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
}

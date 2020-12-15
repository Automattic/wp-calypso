<?php
/**
 * Block Patterns file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Patterns_From_API
 */
class Block_Patterns_From_API {

	const PATTERN_NAMESPACE = 'a8c/';

	/**
	 * Class instance.
	 *
	 * @var Block_Patterns
	 */
	private static $instance = null;

	/**
	 * Cache key for patterns array.
	 *
	 * @var string
	 */
	private $patterns_cache_key;

	/**
	 * Block_Patterns constructor.
	 */
	private function __construct() {
		$this->patterns_cache_key = sha1(
			implode(
				'_',
				array(
					'block_patterns',
					PLUGIN_VERSION,
					$this->get_block_patterns_locale(),
				)
			)
		);

		$this->register_patterns();
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Block_Patterns
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register FSE block patterns and categories.
	 */
	private function register_patterns() {
		if ( class_exists( 'WP_Block_Patterns_Registry' ) ) {
			// Remove core patterns.
			foreach ( \WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) {
				if ( 'core/' === substr( $pattern['name'], 0, 5 ) ) {
					unregister_block_pattern( $pattern['name'] );
				}
			}
		}

		$pattern_categories = array();
		$block_patterns     = $this->get_patterns();

		foreach ( (array) $block_patterns as $pattern ) {
			foreach ( (array) $pattern['categories'] as $slug => $category ) {
				$pattern_categories[ $slug ] = $category['title'];
			}
		}

		// Order categories alphabetically and register them.
		asort( $pattern_categories );
		foreach ( (array) $pattern_categories as $slug => $label ) {
			register_block_pattern_category( $slug, array( 'label' => $label ) );
		}

		foreach ( (array) $block_patterns as $pattern ) {
			if ( $this->can_register_pattern( $pattern ) ) {
				$is_premium = isset( $pattern['pattern_meta']['is_premium'] ) ? boolval( $pattern['pattern_meta']['is_premium'] ) : false;

				register_block_pattern(
					Block_Patterns_From_API::PATTERN_NAMESPACE . $pattern['name'],
					array(
						'title'         => $pattern['title'],
						'description'   => $pattern['description'],
						'content'       => $pattern['html'],
						'viewportWidth' => 1280,
						'categories'    => array_keys(
							$pattern['categories']
						),
						'isPremium'     => $is_premium,
					)
				);
			}
		}
	}

	/**
	 * Returns a list of patterns.
	 *
	 * @return array
	 */
	private function get_patterns() {
		$override_source_site = apply_filters( 'a8c_override_patterns_source_site', false );
		if ( $override_source_site ) {
			// Skip caching and request all patterns from a specified source site.
			// This allows testing patterns in development with immediate feedback
			// while avoiding polluting the cache. Note that this request gets
			// all patterns on the source site, not just those with the 'pattern' tag.
			$request_url = esc_url_raw(
				add_query_arg(
					array(
						'site' => $override_source_site,
					),
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $this->get_block_patterns_locale()
				)
			);

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

		$block_patterns = wp_cache_get( $this->patterns_cache_key, 'ptk_patterns' );

		// Load fresh data if we don't have any patterns.
		if ( false === $block_patterns || ( defined( 'WP_DISABLE_PATTERN_CACHE' ) && WP_DISABLE_PATTERN_CACHE ) ) {
			$request_url = esc_url_raw(
				add_query_arg(
					array(
						'tags' => 'pattern',
					),
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $this->get_block_patterns_locale()
				)
			);

			$args = array( 'timeout' => 20 );

			if ( function_exists( 'wpcom_json_api_get' ) ) {
				$response = wpcom_json_api_get( $request_url, $args );
			} else {
				$response = wp_remote_get( $request_url, $args );
			}

			if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
				return array();
			}
			$block_patterns = json_decode( wp_remote_retrieve_body( $response ), true );
			wp_cache_add( $this->patterns_cache_key, $block_patterns, 'ptk_patterns', DAY_IN_SECONDS );
		}

		return $block_patterns;
	}

	/**
	 * Get the locale to be used for fetching block patterns
	 */
	private function get_block_patterns_locale() {
		// Make sure to get blog locale, not user locale.
		$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
		return \A8C\FSE\Common\get_iso_639_locale( $language );
	}

	/**
	 * Check that the pattern is allowed to be registered.
	 *
	 * Checks for pattern_meta tags with a prefix of `requires-` in the name, and then attempts to match
	 * the remainder of the name to a theme feature.
	 *
	 * For example, to prevent patterns that depend on wide or full-width block alignment support
	 * from being registered in sites where the active theme does not have `align-wide` support,
	 * we can add the `requires-align-wide` pattern_meta tag to the pattern. This function will
	 * then match against that pattern_meta tag, and then return `false`.
	 *
	 * @param array $pattern    A pattern with a 'pattern_meta' array where the key is the tag slug in English.
	 *
	 * @return bool
	 */
	private function can_register_pattern( $pattern ) {
		if ( empty( $pattern['pattern_meta'] ) ) {
			// Default to allowing patterns without metadata to be registered.
			return true;
		}

		foreach ( $pattern['pattern_meta'] as $pattern_meta => $value ) {
			// Match against tags with a non-translated slug beginning with `requires-`.
			$split_slug = preg_split( '/^requires-/', $pattern_meta );

			// If the theme does not support the matched feature, then skip registering the pattern.
			if ( isset( $split_slug[1] ) && false === get_theme_support( $split_slug[1] ) ) {
				return false;
			}
		}

		return true;
	}
}


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
	 * Whether or not to exclude patterns that require wide or full alignment support
	 *
	 * @var bool
	 */
	private $skip_full_width_patterns = false;

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

		if ( ! get_theme_support( 'align-wide' ) ) {
			$this->skip_full_width_patterns = true;
		}

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

		foreach ( (array) $this->get_patterns() as $pattern ) {
			foreach ( (array) $pattern['categories'] as $slug => $category ) {
				$pattern_categories[ $slug ] = $category['title'];
			}
		}

		// Order categories alphabetically and register them.
		asort( $pattern_categories );
		foreach ( (array) $pattern_categories as $slug => $label ) {
			register_block_pattern_category( $slug, array( 'label' => $label ) );
		}

		foreach ( (array) $this->get_patterns() as $pattern ) {
			if ( $this->can_register_pattern( $pattern ) ) {
				register_block_pattern(
					Block_Patterns_From_API::PATTERN_NAMESPACE . $pattern['name'],
					array(
						'title'         => $pattern['title'],
						'description'   => $pattern['title'],
						'content'       => $pattern['html'],
						'viewportWidth' => 1280,
						'categories'    => array_keys(
							$pattern['categories']
						),
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
	 * @param array $pattern    A pattern with a 'tags' array where the key is the tag slug in English.
	 *
	 * @return bool
	 */
	private function can_register_pattern( $pattern ) {
		if ( $this->skip_full_width_patterns && in_array( 'requires_align_wide', array_keys( $pattern['tags'] ), true ) ) {
			return false;
		}
		return true;
	}
}

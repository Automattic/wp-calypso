<?php
/**
 * Block Patterns file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Block_Patterns
 */
class Block_Patterns {

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
	 * Patterns source site ID.
	 *
	 * @var int
	 */
	private $source_site_id = 174455321;

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
					$this->get_iso_639_locale(),
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
		$block_patterns = $this->get_patterns();

		foreach ( (array) $this->get_patterns() as $pattern ) {
			foreach ( (array) $pattern['tags'] as $slug => $tag ) {
				register_block_pattern_category( $slug, array( 'label' => $tag['title'] ) );
			}

			register_block_pattern(
				Block_Patterns::PATTERN_NAMESPACE . $pattern['name'],
				array(
					'title'         => $pattern['title'],
					'description'   => $pattern['title'],
					'content'       => $pattern['html'],
					'viewportWidth' => 1280,
					'categories'    => array_keys(
						$pattern['tags']
					),
				)
			);
		}
	}

	/**
	 * Returns a list of patterns.
	 *
	 * @return array
	 */
	private function get_patterns() {
		$block_patterns = get_transient( $this->patterns_cache_key );

		// Load fresh data if we don't have any patterns.
		if ( false === $block_patterns || ( defined( 'WP_DISABLE_PATTERN_CACHE' ) && WP_DISABLE_PATTERN_CACHE ) ) {
			$request_url = add_query_arg(
				array(
					'site'     => $this->source_site_id,
					'language' => $this->get_iso_639_locale(),
				),
				'https://public-api.wordpress.com/rest/v1/ptk/patterns'
			);

			$response = wp_remote_get(
				esc_url_raw( $request_url ),
				array( 'timeout' => 20 )
			);

			if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
				return array();
			}
			$block_patterns = json_decode( wp_remote_retrieve_body( $response ), true );
			set_transient( $this->patterns_cache_key, $block_patterns, DAY_IN_SECONDS );
		}

		return $block_patterns;
	}

	/**
	 * Returns ISO 639 conforming locale string.
	 *
	 * @return string ISO 639 locale string
	 */
	private function get_iso_639_locale() {
		// Make sure to get blog locale, not user locale.
		$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
		$language = strtolower( $language );

		if ( in_array( $language, array( 'pt_br', 'pt-br', 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn' ), true ) ) {
			$language = str_replace( '_', '-', $language );
		} else {
			$language = preg_replace( '/([-_].*)$/i', '', $language );
		}

		return $language;
	}
}

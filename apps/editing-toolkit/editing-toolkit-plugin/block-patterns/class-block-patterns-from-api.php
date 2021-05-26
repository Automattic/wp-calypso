<?php
/**
 * Block Patterns file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

require_once __DIR__ . '/class-block-patterns-utils.php';

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
	 * Valid source strings for retrieving patterns.
	 *
	 * @var array
	 */
	private $valid_patterns_sources = array( 'block_patterns', 'fse_block_patterns' );

	/**
	 * Patterns source sites.
	 *
	 * @var array
	 */
	private $patterns_sources;

	/**
	 * A collection of utility methods.
	 *
	 * @var Block_Patterns_Utils
	 */
	private $utils;

	/**
	 * A dictionary to map existing WPCOM pattern categories to core patterns.
	 * These should match the categories in $patterns_sources,
	 * which are registered in $this->register_patterns()
	 *
	 * @var array
	 */
	private $core_to_wpcom_categories_dictionary;

	/**
	 * Block_Patterns constructor.
	 *
	 * @param array                $patterns_sources A array of strings, each of which matches a valid source for retrieving patterns.
	 * @param Block_Patterns_Utils $utils            A class dependency containing utils methods.
	 */
	public function __construct( $patterns_sources, Block_Patterns_Utils $utils = null ) {
		$patterns_sources       = empty( $patterns_sources ) ? array( 'block_patterns' ) : $patterns_sources;
		$this->patterns_sources = empty( array_diff( $patterns_sources, $this->valid_patterns_sources ) ) ? $patterns_sources : array( 'block_patterns' );
		$this->utils            = empty( $utils ) ? new \A8C\FSE\Block_Patterns_Utils() : $utils;
		// Add categories to this array using the core pattern name as the key for core patterns we wish to "recategorize".
		$this->core_to_wpcom_categories_dictionary = array(
			'core/quote' => array(
				'quotes' => __( 'Quotes', 'full-site-editing' ),
				'text'   => __( 'Text', 'full-site-editing' ),
			),
		);
	}

	/**
	 * Register FSE block patterns and categories.
	 *
	 * @return array Results of pattern registration.
	 */
	public function register_patterns() {
		$this->reregister_core_patterns();

		// Used to track which patterns we successfully register.
		$results = array();

		// For every pattern source site, fetch the patterns.
		foreach ( $this->patterns_sources as $patterns_source ) {
			$patterns_cache_key = $this->utils->get_patterns_cache_key( $patterns_source );

			$pattern_categories = array();
			$block_patterns     = $this->get_patterns( $patterns_cache_key, $patterns_source );

			foreach ( (array) $block_patterns as $pattern ) {
				foreach ( (array) $pattern['categories'] as $slug => $category ) {
					$pattern_categories[ $slug ] = array( 'label' => $category['title'] );
				}
			}

			// Unregister existing categories so that we can insert them in the desired order (alphabetically).
			$existing_categories = array();
			foreach ( \WP_Block_Pattern_Categories_Registry::get_instance()->get_all_registered() as $existing_category ) {
				$existing_categories[ $existing_category['name'] ] = $existing_category;
				unregister_block_pattern_category( $existing_category['name'] );
			}

			$pattern_categories = array_merge( $pattern_categories, $existing_categories );

			// Order categories alphabetically by their label.
			uasort(
				$pattern_categories,
				function ( $a, $b ) {
					return strnatcasecmp( $a['label'], $b['label'] );
				}
			);

			// Move the Featured category to be the first category.
			if ( isset( $pattern_categories['featured'] ) ) {
				$featured_category  = $pattern_categories['featured'];
				$pattern_categories = array( 'featured' => $featured_category ) + $pattern_categories;
			}

			// Register categories (and re-register existing categories).
			foreach ( (array) $pattern_categories as $slug => $category_properties ) {
				register_block_pattern_category( $slug, $category_properties );
			}

			foreach ( (array) $block_patterns as $pattern ) {
				if ( $this->can_register_pattern( $pattern ) ) {
					$is_premium = isset( $pattern['pattern_meta']['is_premium'] ) ? boolval( $pattern['pattern_meta']['is_premium'] ) : false;

					// Set custom viewport width for the pattern preview with a
					// default width of 1280 and ensure a safe minimum width of 320.
					$viewport_width = isset( $pattern['pattern_meta']['viewport_width'] ) ? intval( $pattern['pattern_meta']['viewport_width'] ) : 1280;
					$viewport_width = $viewport_width < 320 ? 320 : $viewport_width;
					$pattern_name   = self::PATTERN_NAMESPACE . $pattern['name'];
					$block_types    = $this->utils->maybe_get_pattern_block_types_from_pattern_meta( $pattern );

					$results[ $pattern_name ] = register_block_pattern(
						$pattern_name,
						array(
							'title'         => $pattern['title'],
							'description'   => $pattern['description'],
							'content'       => $pattern['html'],
							'viewportWidth' => $viewport_width,
							'categories'    => array_keys(
								$pattern['categories']
							),
							'isPremium'     => $is_premium,
							'blockTypes'    => $block_types,
						)
					);
				}
			}
		}

		$this->update_core_patterns_with_wpcom_categories();

		return $results;
	}

	/**
	 * Returns a list of patterns.
	 *
	 * @param string $patterns_cache_key Key to store responses to and fetch responses from cache.
	 * @param string $patterns_source    Slug for valid patterns source site, e.g., `block_patterns`.
	 * @return array                      The list of translated patterns.
	 */
	private function get_patterns( $patterns_cache_key, $patterns_source ) {
		$override_source_site = apply_filters( 'a8c_override_patterns_source_site', false );
		if ( $override_source_site ) {
			// Skip caching and request all patterns from a specified source site.
			// This allows testing patterns in development with immediate feedback
			// while avoiding polluting the cache. Note that this request gets
			// all patterns on the source site, not just those with the 'pattern' tag.
			$request_url = esc_url_raw(
				add_query_arg(
					array(
						'site'         => $override_source_site,
						'tags'         => 'pattern',
						'pattern_meta' => 'is_web',
					),
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $this->utils->get_block_patterns_locale()
				)
			);

			return $this->utils->remote_get( $request_url );
		}

		$block_patterns = $this->utils->cache_get( $patterns_cache_key, 'ptk_patterns' );

		// Load fresh data if we don't have any patterns.
		if ( false === $block_patterns || ( defined( 'WP_DISABLE_PATTERN_CACHE' ) && WP_DISABLE_PATTERN_CACHE ) ) {
			$request_url = esc_url_raw(
				add_query_arg(
					array(
						'tags'            => 'pattern',
						'pattern_meta'    => 'is_web',
						'patterns_source' => $patterns_source,
					),
					'https://public-api.wordpress.com/rest/v1/ptk/patterns/' . $this->utils->get_block_patterns_locale()
				)
			);

			$block_patterns = $this->utils->remote_get( $request_url );

			$this->utils->cache_add( $patterns_cache_key, $block_patterns, 'ptk_patterns', DAY_IN_SECONDS );
		}

		return $block_patterns;
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

	/**
	 * Unregister all core patterns, then reregister core patterns in core WordPress only,
	 * that is those in wp-includes/block-patterns.php
	 * Gutenberg adds new and overrides existing core patterns. We don't want these for now.
	 */
	private function reregister_core_patterns() {
		if ( class_exists( 'WP_Block_Patterns_Registry' ) ) {
			foreach ( \WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) {
				// Gutenberg registers patterns with varying prefixes, but categorizes them using `core/*` in a blockTypes array.
				// This will ensure we remove `query/*` blocks for example.
				// TODO: We need to revisit our usage or $pattern['blockTypes']: they are currently an experimental feature and not guaranteed to reference `core/*` blocks.
				$pattern_block_type_or_name =
					isset( $pattern['blockTypes'] ) && ! empty( $pattern['blockTypes'][0] )
					? $pattern['blockTypes'][0]
					: $pattern['name'];
				if ( 'core/' === substr( $pattern_block_type_or_name, 0, 5 ) ) {
					unregister_block_pattern( $pattern['name'] );
				}
			}
			if ( function_exists( '_register_core_block_patterns_and_categories' ) ) {
				$did_switch_locale = switch_to_locale( $this->utils->get_block_patterns_locale() );
				_register_core_block_patterns_and_categories();
				// The site locale might be the same as the current locale so switching could have failed in such instances.
				if ( false !== $did_switch_locale ) {
					restore_previous_locale();
				}
			}
		}
	}

	/**
	 * Update categories for core patterns if a records exists in $this->core_to_wpcom_categories_dictionary
	 * and reregister them.
	 */
	private function update_core_patterns_with_wpcom_categories() {
		if ( class_exists( 'WP_Block_Patterns_Registry' ) ) {
			foreach ( \WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) {
				$wpcom_categories =
					$pattern['name'] && isset( $this->core_to_wpcom_categories_dictionary[ $pattern['name'] ] )
					? $this->core_to_wpcom_categories_dictionary[ $pattern['name'] ]
					: null;
				if ( $wpcom_categories ) {
					unregister_block_pattern( $pattern['name'] );
					$pattern_properties = array_merge(
						$pattern,
						array( 'categories' => array_keys( $wpcom_categories ) )
					);
					unset( $pattern_properties['name'] );
					register_block_pattern(
						$pattern['name'],
						$pattern_properties
					);
				}
			}
		}
	}
}


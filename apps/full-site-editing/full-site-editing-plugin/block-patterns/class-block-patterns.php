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

	/**
	 * Class instance.
	 *
	 * @var Block_Patterns
	 */
	private static $instance = null;


	/**
	 * Block_Patterns constructor.
	 */
	private function __construct() {
		add_filter( 'block_editor_settings', array( $this, 'register_patterns' ), 11 );
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
	 * Extends block editor settings to include FSE block patterns.
	 *
	 * @param array $settings Default editor settings.
	 * @return array Filtered editor settings.
	 */
	public function register_patterns( $settings ) {
		// Register Block Pattern Categories.
		if ( class_exists( 'WP_Block_Pattern_Categories_Registry' ) ) {
			register_block_pattern_category( 'blog', array( 'label' => _x( 'Blog', 'Block pattern category', 'gutenberg' ) ) );
			register_block_pattern_category( 'call-to-action', array( 'label' => _x( 'Call to Action', 'Block pattern category', 'gutenberg' ) ) );
			register_block_pattern_category( 'contact', array( 'label' => _x( 'Contact', 'Block pattern category', 'gutenberg' ) ) );
			register_block_pattern_category( 'images', array( 'label' => _x( 'Images', 'Block pattern category', 'gutenberg' ) ) );
			register_block_pattern_category( 'menu', array( 'label' => _x( 'Menu', 'Block pattern category', 'gutenberg' ) ) );
		}

		// Remove core patterns except 'Two Columns of Text'.
		$settings['__experimentalBlockPatterns'] = wp_list_filter(
			$settings['__experimentalBlockPatterns'],
			array(
				'title' => 'Two Columns of Text',
			)
		);

		// Add our patterns.
		$settings['__experimentalBlockPatterns'] = array_merge(
			$this->get_patterns(),
			$settings['__experimentalBlockPatterns']
		);

		return $settings;
	}

	/**
	 * Returns a list of patterns.
	 *
	 * @return array
	 */
	public function get_patterns() {
		$patterns_dir = __DIR__ . '/patterns/';
		$patterns     = array();

		if ( ! is_dir( $patterns_dir ) ) {
			return $patterns;
		}

		$directory_handle = opendir( $patterns_dir );
		if ( ! $directory_handle ) {
			return $patterns;
		}

		// Get all the pattern files.
		$pattern       = readdir( $directory_handle );
		$pattern_files = array();
		while ( false !== $pattern ) {
			// Only allow files ending in .json or .php.
			if ( substr( $pattern, -5 ) === '.json' || substr( $pattern, -4 ) === '.php' ) {
				$pattern_files[] = $pattern;
			}

			$pattern = readdir( $directory_handle );
		}

		closedir( $directory_handle );

		// Manually curated list of patterns to go at the top of the list.
		$featured_patterns = array(
			'masonry-gallery.php',
			'description-and-image.php',
			'two-images-and-quote.php',
			'image-and-description.php',
			'three-images-side-by-side.php',
			'image-and-text.php',
			'three-columns-and-image.php',
			'collage-gallery.php',
			'headline.php',
			'headline-02.php',
			'recent-posts.php',
			'recent-posts-02.php',
			'two-images-side-by-side.php',
			'numbers.php',
			'contact.php',
			'contact-02.php',
			'contact-03.php',
			'food-menu.php',
		);

		// Add the featured patterns to the top of the patterns.
		$pattern_files = array_merge( $featured_patterns, array_diff( $pattern_files, $featured_patterns ) );

		// Get the pattern files contents.
		foreach ( $pattern_files as $pattern_file ) {
			if ( substr( $pattern_file, -5 ) === '.json' ) {
				$patterns[] = json_decode(
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					file_get_contents( $patterns_dir . $pattern_file ),
					true
				);
			}

			if ( substr( $pattern_file, -4 ) === '.php' ) {
				$patterns[] = include_once $patterns_dir . $pattern_file;
			}
		}

		return $patterns;
	}
}

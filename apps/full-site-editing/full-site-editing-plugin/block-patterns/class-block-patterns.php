<?php
/**
 * Block Patterns file.
 *
 * @package A8C\EditingToolkit
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
	 * Block_Patterns constructor.
	 */
	private function __construct() {
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
	public function register_patterns() {
		// Register Block Pattern Categories.
		if ( class_exists( 'WP_Block_Pattern_Categories_Registry' ) ) {
			register_block_pattern_category( 'blog', array( 'label' => _x( 'Blog', 'Block pattern category', 'full-site-editing' ) ) );
			register_block_pattern_category( 'call-to-action', array( 'label' => _x( 'Call to Action', 'Block pattern category', 'full-site-editing' ) ) );
			register_block_pattern_category( 'contact', array( 'label' => _x( 'Contact', 'Block pattern category', 'full-site-editing' ) ) );
			register_block_pattern_category( 'images', array( 'label' => _x( 'Images', 'Block pattern category', 'full-site-editing' ) ) );
			register_block_pattern_category( 'list', array( 'label' => _x( 'List', 'Block pattern category', 'full-site-editing' ) ) );

			// The 'Two Columns of Text' pattern is in the 'columns' and 'text' categories.
			// Removing 'columns' so it doesn't appear as a category with only a single item.
			unregister_block_pattern_category( 'columns' );
		}

		if ( class_exists( 'WP_Block_Patterns_Registry' ) ) {
			// Remove core patterns except 'Two Columns of Text'.
			// Unfortunately, \WP_Block_Patterns_Registry::get_instance()->get_all_registered() doesn't return the pattern names as keys.
			foreach ( \WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) {
				if ( 'core/' === substr( $pattern['name'], 0, 5 ) && 'core/text-two-columns' !== $pattern['name'] ) {
					unregister_block_pattern( $pattern['name'] );
				}
			}

			// Add our patterns.
			foreach ( $this->get_patterns() as $name => $pattern ) {
				register_block_pattern( $name, $pattern );
			}
		}
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
				$pattern_name              = self::PATTERN_NAMESPACE . substr( $pattern_file, 0, -5 );
				$patterns[ $pattern_name ] = json_decode(
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					file_get_contents( $patterns_dir . $pattern_file ),
					true
				);
			}

			if ( substr( $pattern_file, -4 ) === '.php' ) {
				$pattern_name              = self::PATTERN_NAMESPACE . substr( $pattern_file, 0, -4 );
				$patterns[ $pattern_name ] = include $patterns_dir . $pattern_file;
			}
		}

		return $patterns;
	}
}

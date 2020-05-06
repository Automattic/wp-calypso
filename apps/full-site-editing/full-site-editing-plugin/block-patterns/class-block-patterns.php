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
				$pattern_files[] = $patterns_dir . $pattern;
			}

			$pattern = readdir( $directory_handle );
		}

		closedir( $directory_handle );

		// Patterns to remove / disable.
		$disabled_patterns = array();

		if ( ! empty( $disabled_patterns ) ) {
			$pattern_files = array_diff( $pattern_files, $disabled_patterns );
		}

		// Manually curated list of patterns to go at the top of the list.
		$featured_patterns = array(
			$patterns_dir . 'image-and-description.php',
			$patterns_dir . 'three-columns-and-image.php',
		);

		// Add the featured patterns to the top of the patterns.
		$pattern_files = $featured_patterns + array_diff( $pattern_files, $featured_patterns );

		// Get the pattern files contents.
		foreach ( $pattern_files as $pattern_file ) {
			if ( substr( $pattern_file, -5 ) === '.json' ) {
				$patterns[] = json_decode(
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					file_get_contents( $pattern_file ),
					true
				);
			}

			if ( substr( $pattern_file, -4 ) === '.php' ) {
				$patterns[] = include_once $pattern_file;
			}
		}

		return $patterns;
	}
}

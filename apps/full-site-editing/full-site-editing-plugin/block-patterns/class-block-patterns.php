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

		$pattern = readdir( $directory_handle );
		while ( false !== $pattern ) {
			if ( substr( $pattern, -5 ) === '.json' ) {
				$patterns[] = json_decode(
					// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
					file_get_contents( $patterns_dir . '/' . $pattern ),
					true
				);
			}

			if ( substr( $pattern, -4 ) === '.php' ) {
				$patterns[] = include_once $patterns_dir . '/' . $pattern;
			}

			$pattern = readdir( $directory_handle );
		}

		closedir( $directory_handle );
		sort( $patterns );

		return $patterns;
	}
}

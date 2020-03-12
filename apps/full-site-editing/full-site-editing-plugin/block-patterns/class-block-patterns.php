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
	 * Starter_Page_Templates constructor.
	 */
	private function __construct() {
		add_filter( 'block_editor_settings', [ $this, 'register_patterns' ], 11 );
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Starter_Page_Templates
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
		$settings['__experimentalBlockPatterns'] = array_merge(
			$this->get_patterns(),
			$settings['__experimentalBlockPatterns']
		);

		return $settings;
	}

	public function get_patterns() {
		$patterns_dir = __DIR__ . '/patterns/';
		$patterns     = [];

		if ( ! is_dir( $patterns_dir ) ) {
			return $patterns;
		}

		$directory_handle = opendir( $patterns_dir );
		if ( ! $directory_handle ) {
			return $patterns;
		}
		while ( ( $pattern = readdir( $directory_handle ) ) !== false ) {
			if ( substr( $pattern, -5 ) == '.json' ) {
				$patterns[] = json_decode(
					file_get_contents( $patterns_dir . '/' . $pattern ),
					true
				);
			}

			if ( substr( $pattern, -4 ) == '.php' ) {
				$patterns[] = include_once $patterns_dir . '/' . $pattern;
			}
		}
		closedir( $directory_handle );
		sort( $patterns );

		return $patterns;
	}
}

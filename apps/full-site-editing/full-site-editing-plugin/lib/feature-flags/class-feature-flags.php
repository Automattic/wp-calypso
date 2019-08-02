<?php
// phpcs:ignoreFile
// This file is not currently used
/**
 * Feature flags file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class Feature_Flags
 */
class Feature_Flags {
	/**
	 * Class instance.
	 *
	 * @var \A8C\FSE\Feature_Flags
	 */
	private static $instance = null;

	/**
	 * Feature flags.
	 *
	 * @var array
	 */
	private $flags = [];

	/**
	 * Parameter and cookie name for storing/retrieving the feature flags.
	 *
	 * @var string
	 */
	const FEATURE_FLAGS = 'fse_feature_flags';

	/**
	 * A8C_Full_Site_Editing_Feature_Flags constructor.
	 */
	private function __construct() {
		$this->set_flags();
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\Feature_Flags
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Get the feature flags.
	 *
	 * @return array
	 */
	public function get_flags() {
		return $this->flags;
	}

	/**
	 * Check if a feature flag is enabled.
	 *
	 * @param  string $flag_name Feature flag.
	 * @return boolean
	 */
	public function is_enabled( $flag_name ) {
		if ( ! isset( $flag_name, $this->flags[ $flag_name ] ) ) {
			return false;
		}

		return (bool) $this->flags[ $flag_name ];
	}

	/**
	 * Set the feature flags based on GET parameter or cookie value.
	 */
	private function set_flags() {
		$flags = null;

		$has_flags_param  = isset( $_GET[ self::FEATURE_FLAGS ] );
		$has_flags_cookie = isset( $_COOKIE[ self::FEATURE_FLAGS ] );

		// Remove all of the flag values when empty parameter is passed.
		if ( $has_flags_param && empty( $_GET[ self::FEATURE_FLAGS ] ) ) {
			setcookie( self::FEATURE_FLAGS, '', time() - 3600 );
			$this->flags = [];
			return;
		}

		if ( $has_flags_param ) {
			setcookie( self::FEATURE_FLAGS, $_GET[ self::FEATURE_FLAGS ] );
			$flags = $_GET[ self::FEATURE_FLAGS ];
		} elseif ( $has_flags_cookie ) {
			$flags = $_COOKIE[ self::FEATURE_FLAGS ];
		}

		if ( empty( $flags ) ) {
			$this->flags = [];
			return;
		}

		// Feature flags are represented as a string of comma-separated feature flag names.
		// For example: "flag1,flag2,-flag3" (leading "-" denotes that the given flag is disabled).
		foreach ( explode( ',', $flags ) as $flag ) {
			$flag       = trim( $flag );
			$is_enabled = '-' !== $flag[0];

			// Strip "-" for disabled flags to obtain the correct name
			$name = $is_enabled ? $flag : substr( $flag, 1 );

			$this->flags[ $name ] = $is_enabled;
		}
	}
}

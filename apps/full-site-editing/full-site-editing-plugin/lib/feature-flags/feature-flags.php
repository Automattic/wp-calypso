<?php
/**
 * Feature flags file.
 *
 * @package full-site-editing
 */

/**
 * Class A8C_Full_Site_Editing_Feature_Flags
 */
class A8C_Full_Site_Editing_Feature_Flags {
	/**
	 * Class instance.
	 *
	 * @var A8C_Full_Site_Editing_Feature_Flags
	 */
	private static $instance = null;

	/**
	 * Feature flags.
	 *
	 * @var array
	 */
	private $flags = array();

	/**
	 * A8C_Full_Site_Editing_Feature_Flags constructor.
	 */
	private function __construct() {
		$this->set_flags();
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C_Full_Site_Editing_Feature_Flags
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Set the feature flags.
	 */
	private function set_flags() {
		$flags = '';

		if ( isset( $_GET[ 'fse_flags' ] ) ) {
			if ( empty( $_GET[ 'fse_flags' ] ) ) {
				setcookie( 'fse_flags', '', time() - 3600 );
				$this->flags = array();
				return;
			}

			setcookie( 'fse_flags', $_GET[ 'fse_flags' ] );
			$flags = $_GET[ 'fse_flags' ];
		} else if( isset( $_COOKIE[ 'fse_flags' ] ) ) {
			$flags = $_COOKIE[ 'fse_flags' ];
		}

		if ( empty( $flags ) ) {
			return;
		}

		$flags = explode( ',', $flags );
		foreach( $flags as $flag ) {
			if ( 0 === strpos( $flag, '-' ) ) {
				$this->flags[ substr( $flag, 1 ) ] = false;
			} else {
				$this->flags[ $flag ] = true;
			}
		}
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
	 * @param  string  $flag Feature flag.
	 * @return boolean
	 */
	public function is_enabled( $flag ) {
		if ( ! isset( $flag ) ) {
			return false;
		}
		return array_key_exists( $flag, $this->flags ) ? $this->flags[ $flag ] : false;
	}
}

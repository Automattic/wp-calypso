<?php

class A8C_Full_Site_Editing_Feature_Flags {
	private $flags = array();

	public function __construct() {
		$this->set_flags();
	}

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

		$flags = explode( ',', $flags );
		foreach( $flags as $flag ) {
			if ( 0 === strpos( $flag, '-' ) ) {
				$this->flags[ substr( $flag, 1 ) ] = false;
			} else {
				$this->flags[ $flag ] = true;
			}
		}
	}

	public function get_flags() {
		return $this->flags;
	}

	public function is_enabled( $flag ) {
		if ( ! isset( $flag ) ) {
			return false;
		}
		return in_array( $flag, $this->flags );
	}
}

$feature_flags = new A8C_Full_Site_Editing_Feature_Flags();

<?php

class WP_Interface_Toolkit {

	protected static $instance;

	/** @todo expose these as a global? */
	protected static $screens = [];

	public static function get_instance(){
		if ( self::$instance === null ) {
			self::$instance = new self;
		}
		return self::$instance;
	}

	public function register_screen( $slug, $opts = [] ) {
		if ( ! isset( $opts['id'] ) ) {
			$opts['id'] = $slug;
		}

		if ( ! class_exists( 'WP_Interface_Screen' ) ) {
			require __DIR__ . '/class-wp-interface-screen.php';
		}
		self::$screens[ $slug ] = new WP_Interface_Screen( $slug, $opts );
	}
}

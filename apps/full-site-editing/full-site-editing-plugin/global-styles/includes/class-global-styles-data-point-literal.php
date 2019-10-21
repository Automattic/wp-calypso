<?php

namespace A8C\Global_Styles;

require_once __DIR__ . '/interface-global-styles-data-point.php';

/**
 * Literal Data Point.
 */
class Literal implements Data_Point {

	/**
	 * Holds the literal value.
	 *
	 * @var any
	 */
	private $value;

	/**
	 * Constructor.
	 *
	 * @param any $meta Data point description.
	 */
	public function __construct( $meta ) {
		if ( array_key_exists( 'default', $meta ) ) {
			$this->value = $meta['default'];
		}
	}

	/**
	 * Implements \A8C\Global_Styles\Data_Point interface.
	 *
	 * @return any The literal value.
	 */
	public function get_value() {
		return $this->value;
	}

}

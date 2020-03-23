<?php
/**
 * Class Data Point Literal.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

require_once __DIR__ . '/interface-data-point.php';

/**
 * Literal Data Point.
 */
class Data_Point_Literal implements Data_Point {

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
	 * Implements \Automattic\Jetpack\Global_Styles\Data_Point interface.
	 *
	 * @return any The literal value.
	 */
	public function get_value() {
		return $this->value;
	}

}

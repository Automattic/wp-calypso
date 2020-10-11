<?php
/**
 * Interface Data Point.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

interface Data_Point {
	/**
	 * Return value of the data point.
	 *
	 * @return any
	 */
	public function get_value();
}

<?php
/**
 * Class Data Point Theme.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

require_once __DIR__ . '/interface-data-point.php';

/**
 * Theme Data Point.
 */
class Data_Point_Theme implements Data_Point {

	/**
	 * Feature name.
	 *
	 * @var string
	 */
	private $feature_name;

	/**
	 * Option property to access, if exists.
	 *
	 * @var string
	 */
	private $feature_property;

	/**
	 * Default value to return if no found.
	 *
	 * @var string
	 */
	private $default_value;

	/**
	 * Constructor.
	 *
	 * @param array $meta Data point description.
	 */
	public function __construct( $meta ) {
		if ( is_array( $meta['name'] ) ) {
			$this->feature_name     = $meta['name'][0];
			$this->feature_property = $meta['name'][1];
		} else {
			$this->feature_name = $meta['name'];
		}

		if ( array_key_exists( 'default', $meta ) ) {
			$this->default_value = $meta['default'];
		}
	}

	/**
	 * Implements the \Automattic\Jetpack\Global_Styles\Data_Point interface.
	 */
	public function get_value() {
		$theme_support = get_theme_support( $this->feature_name );
		if ( is_array( $theme_support ) ) {
			$theme_support = $theme_support[0];
		}

		if ( is_bool( $theme_support ) ) {
			return $this->default_value;
		}

		if (
			is_array( $theme_support ) &&
			! isset( $this->feature_property )
		) {
			return $theme_support;
		}

		if (
			is_array( $theme_support ) &&
			isset( $this->feature_property ) &&
			array_key_exists( $this->feature_property, $theme_support )
		) {
			return $theme_support[ $this->feature_property ];
		}

		if (
			is_array( $theme_support ) &&
			isset( $this->feature_property ) &&
			! array_key_exists( $this->feature_property, $theme_support )
		) {
			return $this->default_value;
		}

		return $this->default_value;
	}

}

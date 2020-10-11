<?php
/**
 * Class Data Set.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

/**
 * Utility to retrieve data from a description.
 */
class Data_Set {

	/**
	 * Description of the data points to work with.
	 *
	 * @var array
	 */
	private $data_meta = array();

	/**
	 * Set of objects that implement the Data_Point interface.
	 *
	 * @var array
	 */
	private $data_set = array();

	/**
	 * Constructor
	 *
	 * @param array $data_meta Description of the data points to work with.
	 */
	public function __construct( $data_meta ) {
		$this->data_meta = $data_meta;
		$this->data_set  = $this->build_data_set( $data_meta );
	}

	/**
	 * Build data set from the meta data provided.
	 *
	 * @param array $data_meta Meta data description.
	 * @return array The data set structure.
	 */
	private function build_data_set( $data_meta ) {
		require_once __DIR__ . '/class-data-point-literal.php';
		require_once __DIR__ . '/class-data-point-option.php';
		require_once __DIR__ . '/class-data-point-theme.php';

		$result = array();
		foreach ( $data_meta as $key => $meta ) {
			if ( $this->is_data_point_literal( $meta ) ) {
				$result[ $key ] = new Data_Point_Literal( $meta );
			} elseif ( $this->is_data_point_option( $meta ) ) {
				$result[ $key ] = new Data_Point_Option( $meta );
			} elseif ( $this->is_data_point_theme( $meta ) ) {
				$result[ $key ] = new Data_Point_Theme( $meta );
			}
		}
		return $result;
	}

	/**
	 * Whether the description provided is a data point
	 * whose value should be taken literally.
	 *
	 * @param array $meta Data point description.
	 * @return boolean
	 */
	private function is_data_point_literal( $meta ) {
		return array_key_exists( 'type', $meta ) && 'literal' === $meta['type'];
	}

	/**
	 * Whether the description provided is a data point
	 * whose value should be taken from an option.
	 *
	 * @param array $meta Data point description.
	 * @return boolean
	 */
	private function is_data_point_option( $meta ) {
		return array_key_exists( 'type', $meta ) &&
			'option' === $meta['type'] &&
			array_key_exists( 'name', $meta );
	}

	/**
	 * Whether the description provided is a data point
	 * that can be updated.
	 *
	 * @param array $meta Data point description.
	 * @return boolean
	 */
	private function is_data_point_updatable( $meta ) {
		return $this->is_data_point_option( $meta ) &&
			array_key_exists( 'updatable', $meta ) &&
			$meta['updatable'];
	}

	/**
	 * Whether the description provided is a data point
	 * whose value should be taken from theme support.
	 *
	 * @param array $meta Data point description.
	 * @return boolean
	 */
	private function is_data_point_theme( $meta ) {
		return array_key_exists( 'name', $meta ) &&
			array_key_exists( 'type', $meta ) &&
			'theme' === $meta['type'];
	}

	/**
	 * Process the data description given and return the values.
	 *
	 * @return array Values.
	 */
	public function get_data() {
		$result = array();
		foreach ( $this->data_set as $key => $data_point ) {
			$result[ $key ] = $data_point->get_value();
		}

		$result = apply_filters( 'jetpack_global_styles_data_set_get_data', $result );

		return $result;
	}

	/**
	 * Process incoming data.
	 *
	 * @param array $incoming_data Incoming data.
	 */
	public function save_data( $incoming_data ) {
		$to_update = array();

		$incoming_data = apply_filters( 'jetpack_global_styles_data_set_save_data', $incoming_data );

		$options_updatable = array_filter(
			$this->data_meta,
			array( $this, 'is_data_point_updatable' )
		);
		foreach ( $options_updatable as $key => $meta ) {
			$option_name = $this->data_set[ $key ]->get_option_name();

			// Get current value, if we haven't yet.
			if ( ! array_key_exists( $option_name, $to_update ) ) {
				$to_update[ $option_name ] = get_option( $option_name );
			}

			// Override with incoming value, if appropiate.
			// At this point it should have been validated, sanitized, etc.
			if ( array_key_exists( $key, $incoming_data ) ) {
				$to_update[ $option_name ] = $this->data_set[ $key ]->process_data_point( $to_update[ $option_name ], $incoming_data[ $key ] );
			}
		}

		$did_update = false;
		foreach ( $to_update as $key => $value ) {
			if ( update_option( $key, $value ) ) {
				$did_update = true;
			}
		}

		return $did_update;
	}
}

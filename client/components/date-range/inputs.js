/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class DateRangeInputs extends Component {
	static propTypes = {
		startDateValue: PropTypes.string.isRequired,
		endDateValue: PropTypes.string.isRequired,
		onInputChange: PropTypes.func,
		onInputBlur: PropTypes.func,
		startLabel: PropTypes.string,
		endLabel: PropTypes.string,
	};

	static defaultProps = {
		startLabel: 'From',
		endLabel: 'To',
		onInputChange: noop,
		onInputBlur: noop,
	};

	/**
	 * Handles input events with fixed arguments
	 * for consistency via partial application
	 *
	 * @param  {string} eventType  one of "change" or "blur"
	 * @param  {string} startOrEnd one of "Start" or "End"
	 * @return {function}            the partially applied function ready to recevie event data
	 */
	handleInputEvent = ( eventType, startOrEnd ) => e => {
		const val = e.target.value;

		if ( eventType === 'change' ) {
			this.props.onInputChange( val, startOrEnd );
		}

		if ( eventType === 'blur' ) {
			this.props.onInputBlur( val, startOrEnd );
		}
	};

	render() {
		return (
			<div className="date-range__date-inputs">
				<div className="date-range__date-input date-range__date-input--from">
					<FormLabel htmlFor="startDate">{ this.props.startLabel }</FormLabel>
					<FormTextInput
						id="startDate"
						name="startDate"
						value={ this.props.startDateValue }
						onChange={ this.handleInputEvent( 'change', 'Start' ) }
						onBlur={ this.handleInputEvent( 'blur', 'Start' ) }
					/>
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor="endDate">{ this.props.endLabel }</FormLabel>
					<FormTextInput
						id="endDate"
						name="endDate"
						value={ this.props.endDateValue }
						onChange={ this.handleInputEvent( 'change', 'End' ) }
						onBlur={ this.handleInputEvent( 'blur', 'End' ) }
					/>
				</div>
			</div>
		);
	}
}

export default DateRangeInputs;

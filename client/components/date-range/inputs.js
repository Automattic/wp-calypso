/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import uuidv4 from 'uuid/v4';

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

	constructor( props ) {
		super( props );

		// Component instance ID
		const uniqueId = uuidv4();

		this.startDateID = `startDate-${ uniqueId }`;
		this.endDateID = `endDate-${ uniqueId }`;
	}

	/**
	 * Handles input events with fixed arguments
	 * for consistency via partial application
	 *
	 * @param  {string} eventType  one of "change" or "blur"
	 * @param  {string} startOrEnd one of "Start" or "End"
	 * @return {function}            the partially applied function ready to recieve event data
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
					<FormLabel htmlFor={ this.startDateID }>{ this.props.startLabel }</FormLabel>
					<FormTextInput
						id={ this.startDateID }
						name={ this.startDateID }
						value={ this.props.startDateValue }
						onChange={ this.handleInputEvent( 'change', 'Start' ) }
						onBlur={ this.handleInputEvent( 'blur', 'Start' ) }
					/>
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor={ this.endDateID }>{ this.props.endLabel }</FormLabel>
					<FormTextInput
						id={ this.endDateID }
						name={ this.endDateID }
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

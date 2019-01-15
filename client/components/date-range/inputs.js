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
	 * Handles input blur events with fixed arguments
	 * for consistency via partial application
	 * @param  {string} startOrEnd one of "Start" or "End"
	 * @return {function}            the partially applied function ready to recieve event data
	 */
	handleInputBlur = startOrEnd => e => {
		const { value } = e.target;
		this.props.onInputBlur( value, startOrEnd );
	};

	/**
	 * Handles input change events with fixed arguments
	 * for consistency via partial application
	 * @param  {string} startOrEnd one of "Start" or "End"
	 * @return {function}            the partially applied function ready to recieve event data
	 */
	handleInputChange = startOrEnd => e => {
		const { value } = e.target;
		this.props.onInputChange( value, startOrEnd );
	};

	render() {
		return (
			<fieldset class="date-range__date-inputs">
				<legend class="date-range__date-inputs-legend">Start and End Dates</legend>
				<div className="date-range__date-inputs-inner">
					<div className="date-range__date-input date-range__date-input--from">
						<FormLabel htmlFor={ this.startDateID }>{ this.props.startLabel }</FormLabel>
						<FormTextInput
							id={ this.startDateID }
							name={ this.startDateID }
							value={ this.props.startDateValue }
							onChange={ this.handleInputChange( 'Start' ) }
							onBlur={ this.handleInputBlur( 'Start' ) }
						/>
					</div>
					<div className="date-range__date-input date-range__date-input--to">
						<FormLabel htmlFor={ this.endDateID }>{ this.props.endLabel }</FormLabel>
						<FormTextInput
							id={ this.endDateID }
							name={ this.endDateID }
							value={ this.props.endDateValue }
							onChange={ this.handleInputChange( 'End' ) }
							onBlur={ this.handleInputBlur( 'End' ) }
						/>
					</div>
				</div>
			</fieldset>
		);
	}
}

export default DateRangeInputs;

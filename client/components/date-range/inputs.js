/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import uuidv4 from 'uuid/v4';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

export class DateRangeInputs extends Component {
	static propTypes = {
		startDateValue: PropTypes.string.isRequired,
		endDateValue: PropTypes.string.isRequired,
		onInputChange: PropTypes.func,
		onInputBlur: PropTypes.func,
		onInputFocus: PropTypes.func,
		startLabel: PropTypes.string,
		endLabel: PropTypes.string,
	};

	static defaultProps = {
		onInputChange: noop,
		onInputBlur: noop,
		onInputFocus: noop,
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

	handleInputFocus = startOrEnd => e => {
		const { value } = e.target;
		this.props.onInputFocus( value, startOrEnd );
	};

	render() {
		// => "MM/DD/YYYY" (or locale equivalent)
		const localeDateFormat = this.props.moment.localeData().longDateFormat( 'L' );

		// If we haven't received a actual date then don't show anything and utilise the placeholder
		// as it is supposed to be used
		const startValue =
			this.props.startDateValue !== localeDateFormat ? this.props.startDateValue : '';
		const endValue = this.props.endDateValue !== localeDateFormat ? this.props.endDateValue : '';

		return (
			<fieldset className="date-range__date-inputs">
				<legend className="date-range__date-inputs-legend">Start and End Dates</legend>
				<div className="date-range__date-inputs-inner">
					<div className="date-range__date-input date-range__date-input--from">
						<FormLabel htmlFor={ this.startDateID }>
							{ this.props.startLabel ||
								this.props.translate( 'From', {
									comment: 'DateRange text input label for the start of the date range',
								} ) }
						</FormLabel>
						<FormTextInput
							id={ this.startDateID }
							name={ this.startDateID }
							value={ startValue }
							onChange={ this.handleInputChange( 'Start' ) }
							onBlur={ this.handleInputBlur( 'Start' ) }
							onFocus={ this.handleInputFocus( 'Start' ) }
							placeholder={ localeDateFormat }
						/>
					</div>
					<div className="date-range__date-input date-range__date-input--to">
						<FormLabel htmlFor={ this.endDateID }>
							{ this.props.startLabel ||
								this.props.translate( 'To', {
									comment: 'DateRange text input label for the end of the date range',
								} ) }
						</FormLabel>
						<FormTextInput
							id={ this.endDateID }
							name={ this.endDateID }
							value={ endValue }
							onChange={ this.handleInputChange( 'End' ) }
							onBlur={ this.handleInputBlur( 'End' ) }
							onFocus={ this.handleInputFocus( 'End' ) }
							placeholder={ localeDateFormat }
						/>
					</div>
				</div>
			</fieldset>
		);
	}
}

export default localize( DateRangeInputs );

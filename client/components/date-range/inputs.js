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
		fromDateValue: PropTypes.string.isRequired,
		toDateValue: PropTypes.string.isRequired,
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

	render() {
		return (
			<div className="date-range__date-inputs">
				<div className="date-range__date-input date-range__date-input--from">
					<FormLabel htmlFor="startDate">{ this.props.startLabel }</FormLabel>
					<FormTextInput
						id="startDate"
						name="startDate"
						value={ this.props.fromDateValue }
						onChange={ this.props.onInputChange }
						onBlur={ this.props.onInputBlur }
					/>
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor="endDate">{ this.props.endLabel }</FormLabel>
					<FormTextInput
						id="endDate"
						name="endDate"
						value={ this.props.toDateValue }
						onChange={ this.props.onInputChange }
						onBlur={ this.props.onInputBlur }
					/>
				</div>
			</div>
		);
	}
}

export default DateRangeInputs;

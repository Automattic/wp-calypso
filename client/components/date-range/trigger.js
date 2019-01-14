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
import Button from 'components/button';
import Gridicon from 'gridicons';

class DateRangeTrigger extends Component {
	static propTypes = {
		startDateText: PropTypes.string.isRequired,
		endDateText: PropTypes.string.isRequired,
		buttonRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.instanceOf( Button ) } ),
		] ).isRequired,
		onTriggerClick: PropTypes.func,
	};

	static defaultProps = {
		onTriggerClick: noop,
		triggerText: ( startDate, endDate ) => {
			const space = String.fromCharCode( 160 );
			const dash = String.fromCharCode( 45 );
			return `${ startDate }${ space }${ dash }${ space }${ endDate }`;
		},
	};

	dateRangeText() {
		const { startDateText, endDateText } = this.props;
		return this.props.triggerText( startDateText, endDateText );
	}

	render() {
		const props = this.props;

		return (
			<Button
				className="date-range__trigger-btn"
				ref={ props.buttonRef }
				onClick={ props.onTriggerClick }
				compact
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" />
				<span className="date-range__trigger-btn-text">{ this.dateRangeText() }</span>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}
}

export default DateRangeTrigger;

/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export class DateRangeTrigger extends Component {
	static propTypes = {
		startDateText: PropTypes.string.isRequired,
		endDateText: PropTypes.string.isRequired,
		buttonRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.instanceOf( Button ) } ),
		] ).isRequired,
		onTriggerClick: PropTypes.func,
		triggerText: PropTypes.func,
	};

	static defaultProps = {
		onTriggerClick: noop,
		isCompact: false,
	};

	dateRangeText() {
		const { startDateText, endDateText } = this.props;

		if ( this.props.triggerText ) {
			return this.props.triggerText( startDateText, endDateText );
		}

		return this.props.translate( '%(startDateText)s - %(endDateText)s', {
			context: 'Date range text for DateRange input trigger',
			args: {
				startDateText,
				endDateText,
			},
		} );
	}

	render() {
		const props = this.props;

		return (
			<Button
				className="date-range__trigger-btn"
				ref={ props.buttonRef }
				onClick={ props.onTriggerClick }
				compact={ props.isCompact }
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" />
				<span className="date-range__trigger-btn-text">{ this.dateRangeText() }</span>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}
}

export default localize( DateRangeTrigger );

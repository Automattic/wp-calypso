/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import ScreenReaderText from 'components/screen-reader-text';

export class DateRangeTrigger extends Component {
	static propTypes = {
		startDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		endDate: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.instanceOf( moment ),
		] ),
		startDateText: PropTypes.string.isRequired,
		endDateText: PropTypes.string.isRequired,
		buttonRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.instanceOf( Button ) } ),
		] ).isRequired,
		onTriggerClick: PropTypes.func,
		onClearClick: PropTypes.func,
		triggerText: PropTypes.func,
		showClearBtn: PropTypes.bool,
	};

	static defaultProps = {
		onTriggerClick: noop,
		onClearClick: noop,
		isCompact: false,
		showClearBtn: true,
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

		const { startDate, endDate, showClearBtn } = props;

		const canReset = startDate || endDate;

		return (
			<ButtonGroup className="date-range__trigger">
				<Button
					className="date-range__trigger-btn"
					ref={ props.buttonRef }
					onClick={ props.onTriggerClick }
					compact={ props.isCompact }
					aria-haspopup={ true }
				>
					<Gridicon className="date-range__trigger-btn-icon" icon="calendar" aria-hidden="true" />
					<span className="date-range__trigger-btn-text">{ this.dateRangeText() }</span>
					{ ! showClearBtn && <Gridicon aria-hidden="true" icon="chevron-down" /> }
				</Button>
				{ showClearBtn && (
					<Button
						className="date-range__clear-btn"
						compact={ props.isCompact }
						onClick={ this.props.onClearClick }
						disabled={ ! canReset }
						title="Clear date selection"
					>
						<ScreenReaderText>{ this.props.translate( 'Clear date selection' ) }</ScreenReaderText>
						<Gridicon aria-hidden="true" icon="cross" />
					</Button>
				) }
			</ButtonGroup>
		);
	}
}

export default localize( DateRangeTrigger );

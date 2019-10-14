/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Moment } from 'moment';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import ScreenReaderText from 'components/screen-reader-text';
import SharedProps from './shared-props';

interface Props {
	startDate: Date | Moment | null | undefined;
	endDate: Date | Moment | null | undefined;
	startDateText: string;
	endDateText: string;
	buttonRef: object;
	onTriggerClick: () => void;
	onClearClick: () => void;
	triggerText: ( startDateText: string, endDateText: string ) => string;
	showClearBtn: boolean;
}

export function DateRangeTrigger( props: Props & SharedProps & LocalizeProps ) {
	const {
		startDate,
		endDate,
		showClearBtn,
		startDateText,
		endDateText,
		translate,
		triggerText,
	} = props;

	const canReset = startDate || endDate;

	let dateRangeText;
	if ( triggerText ) {
		dateRangeText = triggerText( startDateText, endDateText );
	} else {
		dateRangeText = translate( '%(startDateText)s - %(endDateText)s', {
			context: 'Date range text for DateRange input trigger',
			args: {
				startDateText,
				endDateText,
			},
		} );
	}

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
				<span className="date-range__trigger-btn-text">{ dateRangeText }</span>
				{ ! showClearBtn && <Gridicon aria-hidden="true" icon="chevron-down" /> }
			</Button>
			{ showClearBtn && (
				<Button
					className="date-range__clear-btn"
					compact={ props.isCompact }
					onClick={ props.onClearClick }
					disabled={ ! canReset }
					title="Clear date selection"
				>
					<ScreenReaderText>{ props.translate( 'Clear date selection' ) }</ScreenReaderText>
					<Gridicon aria-hidden="true" icon="cross" />
				</Button>
			) }
		</ButtonGroup>
	);
}

DateRangeTrigger.defaultProps = {
	onTriggerClick: noop,
	onClearClick: noop,
	isCompact: false,
	showClearBtn: true,
};

export default localize( DateRangeTrigger );

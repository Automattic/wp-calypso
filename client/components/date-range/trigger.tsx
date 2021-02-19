/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { noop } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ButtonGroup from 'calypso/components/button-group';
import { ScreenReaderText } from '@automattic/components';

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
	isCompact: boolean;
}

const DateRangeTrigger: FunctionComponent< Props > = ( {
	onTriggerClick = noop,
	onClearClick = noop,
	isCompact = false,
	showClearBtn = true,
	startDate,
	endDate,
	startDateText,
	endDateText,
	triggerText,
	buttonRef,
} ) => {
	const translate = useTranslate();

	const canReset = Boolean( startDate || endDate );

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
				ref={ buttonRef }
				onClick={ onTriggerClick }
				compact={ isCompact }
				aria-haspopup={ true }
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" aria-hidden="true" />
				<span className="date-range__trigger-btn-text">{ dateRangeText }</span>
				{ ! showClearBtn && <Gridicon aria-hidden="true" icon="chevron-down" /> }
			</Button>
			{ showClearBtn && (
				<Button
					className="date-range__clear-btn"
					compact={ isCompact }
					onClick={ onClearClick }
					disabled={ ! canReset }
					title="Clear date selection"
				>
					<ScreenReaderText>{ translate( 'Clear date selection' ) }</ScreenReaderText>
					<Gridicon aria-hidden="true" icon="cross" />
				</Button>
			) }
		</ButtonGroup>
	);
};

export default DateRangeTrigger;

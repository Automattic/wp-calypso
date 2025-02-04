import { Button, ScreenReaderText, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ButtonGroup from 'calypso/components/button-group';
import type { Moment } from 'moment';
import type { FunctionComponent, Ref } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface Props {
	startDate: Date | Moment | null | undefined;
	endDate: Date | Moment | null | undefined;
	startDateText: string;
	endDateText: string;
	buttonRef: Ref< HTMLAnchorElement | HTMLButtonElement > | undefined;
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

	const clearDateSelectionText = translate( 'Clear date selection' );

	return (
		<ButtonGroup className="date-range__trigger">
			<Button
				className="date-range__trigger-btn"
				ref={ buttonRef }
				onClick={ onTriggerClick }
				compact={ isCompact }
				aria-haspopup
				aria-label={ translate( 'Select date range' ) }
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" aria-hidden="true" />
				<span className="date-range__trigger-btn-text" aria-label={ translate( 'Date range' ) }>
					{ dateRangeText }
				</span>
				{ ! showClearBtn && <Gridicon aria-hidden="true" icon="chevron-down" /> }
			</Button>
			{ showClearBtn && (
				<Button
					className="date-range__clear-btn"
					compact={ isCompact }
					onClick={ onClearClick }
					disabled={ ! canReset }
					aria-label={ clearDateSelectionText }
					title={ clearDateSelectionText }
				>
					<ScreenReaderText>{ translate( 'Clear date selection' ) }</ScreenReaderText>
					<Gridicon aria-hidden="true" icon="cross" />
				</Button>
			) }
		</ButtonGroup>
	);
};

export default DateRangeTrigger;

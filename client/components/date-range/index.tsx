import { Button, Popover, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import React, { useState, useRef, useCallback } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import DateRangePicker from './date-range-picker';
import DateRangeHeader from './header';
import DateRangeInputs from './inputs';
import Shortcuts from './shortcuts';
import DateRangeTrigger from './trigger';

import './style.scss';

// Module variables
const NO_DATE_SELECTED_VALUE = null;
const noop = () => {};

interface DateRangeProps {
	selectedStartDate?: Date | moment.Moment;
	selectedEndDate?: Date | moment.Moment;
	onDateSelect?: ( startDate: moment.Moment | null, endDate: moment.Moment | null ) => void;
	onDateCommit?: ( startDate: moment.Moment | null, endDate: moment.Moment | null ) => void;
	firstSelectableDate?: Date | moment.Moment;
	lastSelectableDate?: Date | moment.Moment;
	triggerText?: ( startDate: moment.Moment | null, endDate: moment.Moment | null ) => string;
	isCompact?: boolean;
	showTriggerClear?: boolean;
	renderTrigger?: ( props: any ) => React.ReactNode;
	renderHeader?: ( props: any ) => React.ReactNode;
	renderInputs?: ( props: any ) => React.ReactNode;
	displayShortcuts?: boolean;
	rootClass?: string;
	focusedMonth?: Date | null;
}

export const DateRange: React.FC< DateRangeProps > = ( {
	selectedStartDate,
	selectedEndDate,
	onDateSelect = noop,
	onDateCommit = noop,
	firstSelectableDate,
	lastSelectableDate,
	triggerText,
	isCompact = false,
	showTriggerClear = true,
	renderTrigger = ( props ) => <DateRangeTrigger { ...props } />,
	renderHeader = ( props ) => <DateRangeHeader { ...props } />,
	renderInputs = ( props ) => <DateRangeInputs { ...props } />,
	displayShortcuts = false,
	rootClass = '',
	focusedMonth = null,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const clampDateToRange = useCallback(
		(
			date: moment.Moment,
			{ dateFrom, dateTo }: { dateFrom?: moment.Moment | Date; dateTo?: moment.Moment | Date }
		) => {
			if ( dateFrom && date.isBefore( dateFrom ) ) {
				return moment( dateFrom );
			}
			if ( dateTo && date.isAfter( dateTo ) ) {
				return moment( dateTo );
			}
			return date;
		},
		[ moment ]
	);

	const firstSelectableMoment = firstSelectableDate && moment( firstSelectableDate );
	const lastSelectableMoment = lastSelectableDate && moment( lastSelectableDate );

	const initialStartDate =
		selectedStartDate === null
			? NO_DATE_SELECTED_VALUE
			: clampDateToRange( moment( selectedStartDate ), {
					dateFrom: firstSelectableMoment,
					dateTo: lastSelectableMoment,
			  } );

	const initialEndDate =
		selectedEndDate === null
			? NO_DATE_SELECTED_VALUE
			: clampDateToRange( moment( selectedEndDate ), {
					dateFrom: firstSelectableMoment,
					dateTo: lastSelectableMoment,
			  } );

	const [ popoverVisible, setPopoverVisible ] = useState( false );
	const [ staleStartDate, setStaleStartDate ] = useState< moment.Moment | null >( null );
	const [ staleEndDate, setStaleEndDate ] = useState< moment.Moment | null >( null );
	const [ startDate, setStartDate ] = useState< moment.Moment | null >( initialStartDate );
	const [ endDate, setEndDate ] = useState< moment.Moment | null >( initialEndDate );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ staleDatesSaved, setStaleDatesSaved ] = useState( false );
	const [ textInputStartDate, setTextInputStartDate ] = useState(
		toDateString( initialStartDate )
	);
	const [ textInputEndDate, setTextInputEndDate ] = useState( toDateString( initialEndDate ) );
	const [ focusedMonthState, setFocusedMonthState ] = useState< Date | null >( focusedMonth );

	const triggerButtonRef = useRef< HTMLButtonElement >( null );

	function toDateString( date: moment.Moment | null ): string {
		if ( moment.isMoment( date ) || moment.isDate( date ) ) {
			return moment( date ).format( 'L' );
		}
		return moment.localeData().longDateFormat( 'L' );
	}

	const getNumberOfMonths = () => {
		return window.matchMedia( '(min-width: 480px)' ).matches ? 2 : 1;
	};

	const handleInputChange = ( val: string, startOrEnd: 'Start' | 'End' ) => {
		if ( startOrEnd === 'Start' ) {
			setTextInputStartDate( val );
		} else {
			setTextInputEndDate( val );
		}
	};

	const handleInputBlur = ( val: string, startOrEnd: 'Start' | 'End' ) => {
		if ( val === '' ) {
			return;
		}

		const date = moment( val, moment.localeData().longDateFormat( 'L' ) );
		if ( ! date.isValid() ) {
			return;
		}

		const stateKey = startOrEnd === 'Start' ? 'startDate' : 'endDate';
		const currentDate = stateKey === 'startDate' ? startDate : endDate;

		const isSameDate = currentDate !== null ? currentDate.isSame( date, 'day' ) : false;
		if ( isSameDate ) {
			return;
		}

		if ( stateKey === 'startDate' ) {
			setStartDate( date );
		} else {
			setEndDate( date );
		}
	};

	const handleInputFocus = ( val: string, startOrEnd: 'Start' | 'End' ) => {
		if ( val === '' ) {
			return;
		}

		const date = moment( val, moment.localeData().longDateFormat( 'L' ) );
		if ( ! date.isValid() ) {
			return;
		}

		const numMonthsShowing = getNumberOfMonths();

		if ( startOrEnd === 'End' && numMonthsShowing > 1 ) {
			date.subtract( 1, 'months' );
		}

		setFocusedMonthState( date.toDate() );
	};

	const closePopover = () => setPopoverVisible( false );
	const togglePopover = () => setPopoverVisible( ! popoverVisible );

	const commitDates = () => {
		setStaleStartDate( startDate );
		setStaleEndDate( endDate );
		setStaleDatesSaved( false );
		onDateCommit( startDate, endDate );
		closePopover();
	};

	const closePopoverAndCommit = () => {
		closePopover();
		commitDates();
	};

	const revertDates = () => {
		setStartDate( staleStartDate );
		setEndDate( staleEndDate );
		setStaleDatesSaved( false );
		setTextInputStartDate( toDateString( staleStartDate ) );
		setTextInputEndDate( toDateString( staleEndDate ) );
		onDateCommit( staleStartDate, staleEndDate );
	};

	const closePopoverAndRevert = () => {
		closePopover();
		revertDates();
	};

	const resetDates = () => {
		setStartDate( initialStartDate );
		setEndDate( initialEndDate );
		setStaleDatesSaved( false );
		setTextInputStartDate( toDateString( initialStartDate ) );
		setTextInputEndDate( toDateString( initialEndDate ) );
	};

	const clearDates = () => {
		setStartDate( null );
		setEndDate( null );
		setStaleStartDate( null );
		setStaleEndDate( null );
		setTextInputStartDate( '' );
		setTextInputEndDate( '' );
		onDateCommit( null, null );
	};

	const handleDateRangeChange = (
		newStartDate: moment.Moment | null,
		newEndDate: moment.Moment | null
	) => {
		setStartDate( newStartDate );
		setEndDate( newEndDate );
		setTextInputStartDate( toDateString( newStartDate ) );
		setTextInputEndDate( toDateString( newEndDate ) );
		onDateSelect( newStartDate, newEndDate );
	};

	const renderDateHelp = () => {
		return (
			<div className="date-range__info" role="status" aria-live="polite">
				{ ! startDate &&
					! endDate &&
					translate( '{{icon/}} Please select the {{em}}first{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate &&
					! endDate &&
					translate( '{{icon/}} Please select the {{em}}last{{/em}} day.', {
						components: {
							icon: <Gridicon aria-hidden="true" icon="info" />,
							em: <em />,
						},
					} ) }
				{ startDate && endDate && (
					<Button
						className="date-range__info-btn"
						borderless
						compact
						onClick={ resetDates }
						aria-label={ translate( 'Reset selected dates' ) }
					>
						{ translate( '{{icon/}} reset selected dates', {
							components: { icon: <Gridicon aria-hidden="true" icon="cross-small" /> },
						} ) }
					</Button>
				) }
			</div>
		);
	};

	const renderDatePicker = () => {
		return (
			<DateRangePicker
				firstSelectableDate={ firstSelectableDate }
				lastSelectableDate={ lastSelectableDate }
				selectedStartDate={ startDate }
				selectedEndDate={ endDate }
				onDateRangeChange={ ( startDate: moment.Moment | null, endDate: moment.Moment | null ) =>
					handleDateRangeChange( startDate, endDate )
				}
				focusedMonth={ focusedMonthState }
				numberOfMonths={ getNumberOfMonths() }
			/>
		);
	};

	const renderPopover = () => {
		const headerProps = {
			onApplyClick: commitDates,
			onCancelClick: closePopoverAndRevert,
		};

		const inputsProps = {
			startDateValue: textInputStartDate,
			endDateValue: textInputEndDate,
			onInputChange: handleInputChange,
			onInputBlur: handleInputBlur,
			onInputFocus: handleInputFocus,
		};

		return (
			<Popover
				className="date-range__popover"
				isVisible={ popoverVisible }
				context={ triggerButtonRef.current }
				position="bottom"
				onClose={ closePopoverAndCommit }
			>
				<div className="date-range__popover-content">
					<div className="date-range__popover-inner">
						<div className="date-range__controls">
							{ renderHeader( headerProps ) }
							{ renderDateHelp() }
						</div>
						{ renderInputs( inputsProps ) }
						{ renderDatePicker() }
					</div>
					{ displayShortcuts && (
						<div className="date-range-picker-shortcuts">
							<Shortcuts
								onClick={ ( startDate, endDate ) => handleDateRangeChange( startDate, endDate ) }
							/>
						</div>
					) }
				</div>
			</Popover>
		);
	};

	const rootClassNames = clsx(
		{
			'date-range': true,
			'toggle-visible': popoverVisible,
		},
		rootClass
	);

	const triggerProps = {
		startDate,
		endDate,
		startDateText: toDateString( startDate ),
		endDateText: toDateString( endDate ),
		buttonRef: triggerButtonRef,
		onTriggerClick: togglePopover,
		onClearClick: clearDates,
		triggerText,
		isCompact,
		showClearBtn: showTriggerClear,
	};

	return (
		<div className={ rootClassNames }>
			{ renderTrigger( triggerProps ) }
			{ renderPopover() }
		</div>
	);
};

export default DateRange;

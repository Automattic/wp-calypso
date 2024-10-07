import { Popover } from '@automattic/components';
import clsx from 'clsx';
import { debounce } from 'lodash';
import moment, { Moment } from 'moment';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import DateRangePicker from './date-range-picker';
import DateRangeFooter from './footer';
import DateRangeHeader from './header';
import DateRangeInputs from './inputs';
import Shortcuts, { TypeShortcutId } from './shortcuts';
import DateRangeTrigger from './trigger';

import './style.scss';

const NO_DATE_SELECTED_VALUE = null;

interface DateRangeProps {
	selectedStartDate?: Date | Moment | null;
	selectedEndDate?: Date | Moment | null;
	onDateSelect?: ( startDate: Moment | null, endDate: Moment | null ) => void;
	onDateCommit?: ( startDate: Moment | null, endDate: Moment | null ) => void;
	firstSelectableDate?: Date | Moment;
	lastSelectableDate?: Date | Moment;
	triggerText?: ( startDate: Moment | null, endDate: Moment | null ) => string;
	isCompact?: boolean;
	showTriggerClear?: boolean;
	renderTrigger?: ( props: any ) => JSX.Element;
	renderHeader?: ( props: any ) => JSX.Element;
	renderFooter?: ( props: any ) => JSX.Element;
	renderInputs?: ( props: any ) => JSX.Element;
	displayShortcuts?: boolean;
	rootClass?: string;
	useArrowNavigation?: boolean;
	overlay?: React.ReactNode;
	customTitle?: string;
	onShortcutClick?: (
		shortcutId: TypeShortcutId,
		startDate?: Moment | null,
		endDate?: Moment | null
	) => void;
}

const DateRange: React.FC< DateRangeProps > = ( {
	selectedStartDate = null,
	selectedEndDate = null,
	onDateSelect = () => {},
	onDateCommit = () => {},
	firstSelectableDate,
	lastSelectableDate,
	triggerText,
	isCompact = false,
	showTriggerClear = true,
	renderTrigger = ( props ) => <DateRangeTrigger { ...props } />,
	renderHeader = ( props ) => <DateRangeHeader { ...props } />,
	renderFooter = ( props ) => <DateRangeFooter { ...props } />,
	renderInputs = ( props ) => <DateRangeInputs { ...props } />,
	displayShortcuts = false,
	rootClass = '',
	useArrowNavigation = false,
	overlay = null,
	customTitle = '',
	onShortcutClick,
} ) => {
	const localizedMoment = useLocalizedMoment();

	const clampDateToRange = (
		date: Moment,
		{ dateFrom, dateTo }: { dateFrom?: Moment | Date; dateTo?: Moment | Date }
	): Moment => {
		if ( dateFrom && date.isBefore( dateFrom ) ) {
			return moment( dateFrom );
		}
		if ( dateTo && date.isAfter( dateTo ) ) {
			return moment( dateTo );
		}
		return date;
	};

	function getLocaleDateFormat() {
		return localizedMoment.localeData().longDateFormat( 'L' );
	}

	function formatDateToLocale( date: Moment | Date ) {
		return localizedMoment( date ).format( 'L' );
	}

	function toDateString( date: Moment | Date | null ) {
		if ( moment.isMoment( date ) || moment.isDate( date ) ) {
			return formatDateToLocale( localizedMoment( date ) );
		}
		return getLocaleDateFormat();
	}

	function getNumberOfMonths() {
		return window.matchMedia( '(min-width: 520px)' ).matches ? 2 : 1;
	}

	const getInitialDates = () => {
		const firstSelectableMoment = firstSelectableDate && localizedMoment( firstSelectableDate );
		const lastSelectableMoment = lastSelectableDate && localizedMoment( lastSelectableDate );

		let startDate =
			selectedStartDate === null
				? NO_DATE_SELECTED_VALUE
				: clampDateToRange( localizedMoment( selectedStartDate ), {
						dateFrom: firstSelectableMoment,
						dateTo: lastSelectableMoment,
				  } );

		let endDate =
			selectedEndDate === null
				? NO_DATE_SELECTED_VALUE
				: clampDateToRange( localizedMoment( selectedEndDate ), {
						dateFrom: firstSelectableMoment,
						dateTo: lastSelectableMoment,
				  } );

		if ( startDate && endDate && endDate.isBefore( startDate ) ) {
			[ startDate, endDate ] = [ endDate, startDate ];
		}

		return { startDate, endDate };
	};

	const { startDate: initialStartDate, endDate: initialEndDate } = getInitialDates();

	const [ popoverVisible, setPopoverVisible ] = useState( false );
	const [ startDate, setStartDate ] = useState< Moment | null >( initialStartDate );
	const [ endDate, setEndDate ] = useState< Moment | null >( initialEndDate );
	const [ staleStartDate, setStaleStartDate ] = useState< Moment | null >( null );
	const [ staleEndDate, setStaleEndDate ] = useState< Moment | null >( null );
	const [ textInputStartDate, setTextInputStartDate ] = useState(
		toDateString( initialStartDate )
	);
	const [ textInputEndDate, setTextInputEndDate ] = useState( toDateString( initialEndDate ) );
	const [ focusedMonth, setFocusedMonth ] = useState< Date | null >( null );
	const [ numberOfMonths, setNumberOfMonths ] = useState( getNumberOfMonths() );

	const triggerButtonRef = useRef< HTMLButtonElement >( null );

	const handleResize = useCallback(
		debounce( () => setNumberOfMonths( getNumberOfMonths() ), 250 ),
		[]
	);

	useEffect( () => {
		window.addEventListener( 'resize', handleResize );
		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ handleResize ] );

	const closePopover = () => {
		setPopoverVisible( false );
	};

	const togglePopover = () => {
		setPopoverVisible( ! popoverVisible );
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

		const date = localizedMoment( val, getLocaleDateFormat() );
		if ( ! date.isValid() ) {
			return;
		}

		const stateKey = startOrEnd === 'Start' ? 'startDate' : 'endDate';
		const currentDate = stateKey === 'startDate' ? startDate : endDate;

		if ( currentDate && currentDate.isSame( date, 'day' ) ) {
			return;
		}

		if ( ! startDate ) {
			setStartDate( date );
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

		const date = localizedMoment( val, getLocaleDateFormat() );
		if ( ! date.isValid() ) {
			return;
		}

		if ( startOrEnd === 'End' && numberOfMonths > 1 ) {
			date.subtract( 1, 'months' );
		}

		setFocusedMonth( date.toDate() );
	};

	const commitDates = () => {
		setStaleStartDate( startDate );
		setStaleEndDate( endDate );
		onDateCommit( startDate, endDate );
		closePopover();
	};

	const revertDates = () => {
		setStartDate( staleStartDate );
		setEndDate( staleEndDate );
		setTextInputStartDate( toDateString( staleStartDate ) );
		setTextInputEndDate( toDateString( staleEndDate ) );
		onDateCommit( staleStartDate, staleEndDate );
	};

	const closePopoverAndRevert = () => {
		closePopover();
		revertDates();
	};

	const closePopoverAndCommit = () => {
		closePopover();
		commitDates();
	};

	const resetDates = () => {
		setStartDate( initialStartDate );
		setEndDate( initialEndDate );
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

	const handleDateRangeChange = ( newStartDate: Moment | null, newEndDate: Moment | null ) => {
		setStartDate( newStartDate );
		setEndDate( newEndDate );
		setTextInputStartDate( toDateString( newStartDate ) );
		setTextInputEndDate( toDateString( newEndDate ) );
		onDateSelect( newStartDate, newEndDate );
	};

	const renderPopover = () => {
		const headerProps = {
			customTitle,
			startDate,
			endDate,
			resetDates,
		};

		const footerProps = {
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
					<div
						className={ clsx( 'date-range__popover-inner', {
							'date-range__popover-inner__hasoverlay': !! overlay,
						} ) }
					>
						{ overlay && <div className="date-range__popover-inner-overlay">{ overlay }</div> }
						{ renderHeader( headerProps ) }
						{ renderInputs( inputsProps ) }
						<DateRangePicker
							firstSelectableDate={ firstSelectableDate }
							lastSelectableDate={ lastSelectableDate }
							selectedStartDate={ startDate }
							selectedEndDate={ endDate }
							onDateRangeChange={ handleDateRangeChange }
							focusedMonth={ focusedMonth }
							numberOfMonths={ numberOfMonths }
							useArrowNavigation={ useArrowNavigation }
						/>
						{ renderFooter( footerProps ) }
					</div>
					{ displayShortcuts && (
						<div className="date-range-picker-shortcuts">
							<Shortcuts
								onClick={ handleDateRangeChange }
								locked={ !! overlay }
								startDate={ startDate }
								endDate={ endDate }
								onShortcutClick={ onShortcutClick }
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

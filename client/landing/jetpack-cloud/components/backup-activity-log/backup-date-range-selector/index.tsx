/**
 * External dependencies
 */
import { Moment } from 'moment';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useRef } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';
import { ActivityCount } from '../types';

interface Props {
	activityCounts: ActivityCount[];
	onClick: () => void;
	onDateCommit: ( selectedStartDate: Moment | null, selectedEndDate: Moment | null ) => void;
	selectedEndDate: Moment | null;
	selectedStartDate: Moment | null;
	visible: boolean;
}

const BackupsDateRangeSelector: FunctionComponent< Props > = ( {
	// activityCounts,
	onClick,
	// selectedEndDate,
	// selectedStartDate,
	visible,
} ) => {
	const translate = useTranslate();

	const buttonRef = useRef( null );

	// const onSelectDate = ( selectedDate: Moment ) => {
	// 	// console.log( 'selectedDate: ', selectedDate );
	// };

	return (
		<>
			<Button className="backup-date-range-selector" ref={ buttonRef } onClick={ onClick }>
				{ translate( 'Date range' ) }
			</Button>
			<Popover context={ buttonRef.current } isVisible={ visible } position="bottom">
				<DatePicker
				// calendarViewDate={ this.state.focusedMonth }
				// rootClassNames={ rootClassNames }
				// modifiers={ modifiers }
				// showOutsideDays={ false }
				// fromMonth={ this.momentDateToJsDate( this.props.firstSelectableDate ) }
				// toMonth={ this.momentDateToJsDate( this.props.lastSelectableDate ) }
				// onSelectDay={ onSelectDate }
				// selectedDays={ selected }
				// numberOfMonths={ this.getNumberOfMonths() }
				// disabledDays={ this.getDisabledDaysConfig() }
				/>
			</Popover>
		</>
	);
};

export default BackupsDateRangeSelector;

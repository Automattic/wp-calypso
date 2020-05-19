/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';
import { translate } from 'i18n-calypso';

const handleMonthClick = ( onClick = noop ) => ( event ) => {
	event.preventDefault();
	onClick();
};

export const DatePickerNavBar = ( {
	nextMonth,
	previousMonth,
	onPreviousClick,
	onNextClick,
	className,
	localeUtils,
	showPreviousButton = true,
	showNextButton = true,
} ) => {
	const classes = classNames( 'date-picker__nav-bar', {
		[ className ]: !! className,
	} );
	return (
		<div className={ classes }>
			{ showPreviousButton && (
				<button
					className="date-picker__previous-month button"
					type="button"
					aria-label={ translate( 'Previous month (%s)', {
						comment: 'Aria label for date picker controls',
						args: localeUtils.formatMonthTitle( previousMonth ),
					} ) }
					onClick={ handleMonthClick( onPreviousClick ) }
				>
					{ localeUtils.formatMonthShort( previousMonth ) }
				</button>
			) }

			{ showNextButton && (
				<button
					className="date-picker__next-month button"
					type="button"
					aria-label={ translate( 'Next month (%s)', {
						comment: 'Aria label for date picker controls',
						args: localeUtils.formatMonthTitle( nextMonth ),
					} ) }
					onClick={ handleMonthClick( onNextClick ) }
				>
					{ localeUtils.formatMonthShort( nextMonth ) }
				</button>
			) }
		</div>
	);
};

export default DatePickerNavBar;

import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';

const noop = () => {};

const handleMonthClick =
	( onClick = noop ) =>
	( event ) => {
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
	useArrowNavigation = false,
} ) => {
	const classes = clsx( 'date-picker__nav-bar', {
		[ className ]: !! className,
	} );

	const buttonClass = useArrowNavigation
		? 'date-picker__arrow-button'
		: 'date-picker__month-button';

	return (
		<div className={ classes }>
			{ showPreviousButton && (
				<button
					className={ `date-picker__previous-month ${ buttonClass }` }
					type="button"
					aria-label={ translate( 'Previous month (%s)', {
						comment: 'Aria label for date picker controls',
						args: localeUtils.formatMonthTitle( previousMonth ),
					} ) }
					onClick={ handleMonthClick( onPreviousClick ) }
				>
					{ useArrowNavigation ? (
						<Icon icon={ chevronLeft } />
					) : (
						localeUtils.formatMonthShort( previousMonth )
					) }
				</button>
			) }

			{ showNextButton && (
				<button
					className={ `date-picker__next-month ${ buttonClass }` }
					type="button"
					aria-label={ translate( 'Next month (%s)', {
						comment: 'Aria label for date picker controls',
						args: localeUtils.formatMonthTitle( nextMonth ),
					} ) }
					onClick={ handleMonthClick( onNextClick ) }
				>
					{ useArrowNavigation ? (
						<Icon icon={ chevronRight } />
					) : (
						localeUtils.formatMonthShort( nextMonth )
					) }
				</button>
			) }
		</div>
	);
};

export default DatePickerNavBar;

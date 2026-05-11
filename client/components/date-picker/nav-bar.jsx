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

function defaultFormatMonthShort( date ) {
	return new Intl.DateTimeFormat( undefined, { month: 'short' } ).format( date );
}

function defaultFormatMonthTitle( date ) {
	return new Intl.DateTimeFormat( undefined, { month: 'long', year: 'numeric' } ).format( date );
}

export const DatePickerNavBar = ( {
	nextMonth,
	previousMonth,
	onPreviousClick,
	onNextClick,
	className,
	formatMonthTitle = defaultFormatMonthTitle,
	formatMonthShort = defaultFormatMonthShort,
} ) => {
	const classes = clsx( 'date-picker__nav-bar', {
		[ className ]: !! className,
	} );

	const buttonClass = 'date-picker__month-button button';

	return (
		<nav className={ classes }>
			{ previousMonth && (
				<button
					className={ `date-picker__previous-month ${ buttonClass }` }
					type="button"
					aria-label={ translate( 'Previous month (%s)', {
						comment: 'Aria label for date picker controls',
						args: formatMonthTitle( previousMonth ),
					} ) }
					onClick={ handleMonthClick( onPreviousClick ) }
				>
					{ formatMonthShort( previousMonth ) }
				</button>
			) }

			{ nextMonth && (
				<button
					className={ `date-picker__next-month ${ buttonClass }` }
					type="button"
					aria-label={ translate( 'Next month (%s)', {
						comment: 'Aria label for date picker controls',
						args: formatMonthTitle( nextMonth ),
					} ) }
					onClick={ handleMonthClick( onNextClick ) }
				>
					{ formatMonthShort( nextMonth ) }
				</button>
			) }
		</nav>
	);
};

export function DatePickerChevron( { orientation } ) {
	if ( orientation === 'left' ) {
		return <Icon icon={ chevronLeft } />;
	}
	if ( orientation === 'right' ) {
		return <Icon icon={ chevronRight } />;
	}
	return null;
}

export default DatePickerNavBar;

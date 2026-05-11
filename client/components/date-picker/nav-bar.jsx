import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';

function defaultFormatMonthShort( date ) {
	return new Intl.DateTimeFormat( undefined, { month: 'short' } ).format( date );
}

// Shared shape for the prev/next slot overrides plugged into v9's
// `components.PreviousMonthButton` / `components.NextMonthButton`. v9 calls
// these with `{ type, className, tabIndex, aria-disabled, aria-label, onClick,
// children }`; the wrapper layer also passes `useArrowNavigation` and
// `monthDate` so the button can render an icon or the month abbreviation.
function MonthButton( {
	useArrowNavigation,
	monthDate,
	formatMonthShort = defaultFormatMonthShort,
	sideClassName,
	icon,
	children,
	...buttonProps
} ) {
	// v7 hid the button entirely when navigation in that direction wasn't
	// possible. v9 keeps it in the DOM with `aria-disabled="true"`; match the
	// v7 behaviour so existing tests (and visual layout) line up.
	if ( buttonProps[ 'aria-disabled' ] ) {
		return null;
	}

	const buttonClass = useArrowNavigation
		? 'date-picker__arrow-button'
		: 'date-picker__month-button button';

	return (
		<button { ...buttonProps } type="button" className={ `${ sideClassName } ${ buttonClass }` }>
			{ useArrowNavigation ? <Icon icon={ icon } /> : monthDate && formatMonthShort( monthDate ) }
		</button>
	);
}

export const DatePickerPreviousMonthButton = ( props ) => (
	<MonthButton { ...props } sideClassName="date-picker__previous-month" icon={ chevronLeft } />
);

export const DatePickerNextMonthButton = ( props ) => (
	<MonthButton { ...props } sideClassName="date-picker__next-month" icon={ chevronRight } />
);

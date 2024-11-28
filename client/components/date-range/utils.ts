import { Moment } from 'moment';
import { DATERANGE_PERIOD } from './shortcuts';

interface DateRange {
	from: Moment | null;
	to: Moment | null;
}

export interface Shortcut {
	id: string;
	label: string;
	offset: number;
	range: number;
	period: ( typeof DATERANGE_PERIOD )[ keyof typeof DATERANGE_PERIOD ];
	shortcutId?: string;
}

function findShortcutFromList(
	shortcutList: Shortcut[],
	endDate: Moment,
	daysInRangeDiff: number,
	today: Moment,
	yesterday: Moment
) {
	const shortcut = shortcutList.find( ( element: Shortcut ) => {
		if ( daysInRangeDiff !== element.range ) {
			return null;
		}

		// For the Last xxx Days, including yesterday, which ended yesterday.
		if ( endDate?.isSame( yesterday, 'day' ) && element.offset === 1 ) {
			return element;
		}

		// For Today.
		if ( endDate.isSame( today, 'day' ) && element.offset === 0 ) {
			return element;
		}

		return null;
	} );

	return shortcut;
}

function addDayToRange( day: Moment, range: DateRange ): DateRange {
	if ( ! day || ! day.isValid() ) {
		return range;
	}

	let { from, to } = range;

	from = from?.startOf( 'day' ) ?? null;
	to = to?.startOf( 'day' ) ?? null;
	day = day.startOf( 'day' );

	if ( from?.isSame( day ) ) {
		return { ...range, from: null };
	}
	if ( to?.isSame( day ) ) {
		return { ...range, to: null };
	}

	if ( ! from ) {
		return { ...range, from: day };
	}
	if ( ! to ) {
		return { ...range, to: day };
	}

	if ( day.isBefore( from ) ) {
		return { ...range, from: day };
	}
	if ( day.isAfter( to ) ) {
		return { ...range, to: day };
	}

	const daysFromStart = Math.abs( from.diff( day, 'days' ) );
	const daysFromEnd = Math.abs( to.diff( day, 'days' ) );

	return daysFromStart < daysFromEnd ? { ...range, from: day } : { ...range, to: day };
}

export { addDayToRange, findShortcutFromList };

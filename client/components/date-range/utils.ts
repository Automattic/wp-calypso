import { Moment } from 'moment';

interface DateRange {
	from: Moment | null;
	to: Moment | null;
}

function addDayToRange( day: Moment, range: DateRange ): DateRange {
	if ( ! day || ! day.isValid() ) {
		return range;
	}

	const { from, to } = range;

	if ( from?.isSame( day, 'day' ) ) {
		return { ...range, from: null };
	}
	if ( to?.isSame( day, 'day' ) ) {
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

export { addDayToRange };

import { Moment } from 'moment';

interface DateRange {
	from: Moment | null;
	to: Moment | null;
}

function addDayToRange( day: Moment | null, range: DateRange ): DateRange {
	if ( ! day || ! day.isValid() ) {
		return range;
	}

	const from = range.from?.clone().startOf( 'day' ) ?? null;
	const to = range.to?.clone().startOf( 'day' ) ?? null;
	const selectedDay = day.clone().startOf( 'day' );

	// A complete range exists: start a new selection from the clicked day.
	if ( from && to ) {
		return { ...range, from: selectedDay, to: null };
	}

	// Only one endpoint is set: fill the other, keeping the two days ordered.
	const anchor = from ?? to;
	if ( ! anchor ) {
		return { ...range, from: selectedDay, to: null };
	}

	return selectedDay.isBefore( anchor )
		? { ...range, from: selectedDay, to: anchor }
		: { ...range, from: anchor, to: selectedDay };
}

export { addDayToRange };

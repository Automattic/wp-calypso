import { useMemo } from 'react';
import {
	getCurrentCyclePayoutDate,
	getCurrentCycleActivityWindow,
	getNextPayoutDate,
	getNextPayoutDateActivityWindow,
} from '../lib/get-next-payout-date';

const formatDateWithYear = ( date: Date ) =>
	date.toLocaleString( 'default', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );

const formatDateRange = ( start: Date, finish: Date ) => {
	return `${ formatDateWithYear( start ) } - ${ formatDateWithYear( finish ) }`;
};

export default function useGetPayoutData() {
	return useMemo( () => {
		const now = new Date();

		// Get raw dates
		const nextPayoutDateRaw = getNextPayoutDate( now );
		const currentCyclePayoutDateRaw = getCurrentCyclePayoutDate( now );

		// Get activity windows
		const nextPayoutWindow = getNextPayoutDateActivityWindow( now );
		const currentCycleWindow = getCurrentCycleActivityWindow( now );

		return {
			nextPayoutActivityWindow: formatDateRange( nextPayoutWindow.start, nextPayoutWindow.finish ),
			nextPayoutDate: formatDateWithYear( nextPayoutDateRaw ),
			currentCyclePayoutDate: formatDateWithYear( currentCyclePayoutDateRaw ),
			currentCycleActivityWindow: formatDateRange(
				currentCycleWindow.start,
				currentCycleWindow.finish
			),
			areNextAndCurrentPayoutDatesEqual:
				nextPayoutDateRaw.getTime() === currentCyclePayoutDateRaw.getTime(),
		};
	}, [] );
}

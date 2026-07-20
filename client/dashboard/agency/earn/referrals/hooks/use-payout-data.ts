import { useMemo } from 'react';
import { formatDate } from '../../../../utils/datetime';
import {
	getCurrentCyclePayoutDate,
	getCurrentCycleActivityWindow,
	getNextPayoutDate,
	getNextPayoutDateActivityWindow,
	areNextAndCurrentPayoutDatesEqual,
} from '../lib/get-next-payout-date';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
};

// A4A has no MSD app context, so the locale is a parameter rather than `useLocale()`.
export default function useGetPayoutData( locale: string = 'en' ) {
	return useMemo( () => {
		const formatDay = ( date: Date ) => formatDate( date, locale, DATE_FORMAT );
		const formatRange = ( start: Date, finish: Date ) =>
			`${ formatDay( start ) } - ${ formatDay( finish ) }`;

		const now = new Date();
		const nextPayoutWindow = getNextPayoutDateActivityWindow( now );
		const currentCycleWindow = getCurrentCycleActivityWindow( now );

		return {
			nextPayoutActivityWindow: formatRange( nextPayoutWindow.start, nextPayoutWindow.finish ),
			nextPayoutDate: formatDay( getNextPayoutDate( now ) ),
			currentCyclePayoutDate: formatDay( getCurrentCyclePayoutDate( now ) ),
			currentCycleActivityWindow: formatRange(
				currentCycleWindow.start,
				currentCycleWindow.finish
			),
			areNextAndCurrentPayoutDatesEqual: areNextAndCurrentPayoutDatesEqual( now ),
			isFullQuarter: now.toDateString() === currentCycleWindow.finish.toDateString(),
		};
	}, [ locale ] );
}

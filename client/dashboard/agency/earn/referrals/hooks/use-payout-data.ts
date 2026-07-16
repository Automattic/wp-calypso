import { useMemo } from 'react';
import { useLocale } from '../../../../app/locale';
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

export default function useGetPayoutData() {
	const locale = useLocale();

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

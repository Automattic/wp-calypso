import { useMemo } from 'react';
import { getNextPayoutDate, getNextPayoutDateActivityWindow } from '../lib/get-next-payout-date';

export default function useGetPayoutData() {
	const nextPayoutActivityWindow = useMemo( () => {
		const { start, finish } = getNextPayoutDateActivityWindow( new Date() );
		const startDate = start.toLocaleString( 'default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		} );
		const finishDate = finish.toLocaleString( 'default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		} );
		return `${ startDate } - ${ finishDate }`;
	}, [] );

	const nextPayoutDate = useMemo(
		() =>
			getNextPayoutDate( new Date() ).toLocaleString( 'default', {
				month: 'short',
				day: 'numeric',
			} ),
		[]
	);

	return {
		nextPayoutActivityWindow,
		nextPayoutDate,
	};
}

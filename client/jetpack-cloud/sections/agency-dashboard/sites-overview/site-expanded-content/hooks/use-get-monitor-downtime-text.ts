import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback } from 'react';

const useGetMonitorDowntimeText = () => {
	const translate = useTranslate();

	return useCallback(
		( downtime: number | undefined ): string => {
			if ( ! downtime ) {
				return translate( 'Downtime' );
			}

			const duration = moment.duration( downtime, 'minutes' );

			const days = duration.days();
			const hours = duration.hours();
			const minutes = duration.minutes();

			const formattedDays = days > 0 ? `${ days }d ` : '';
			const formattedHours = hours > 0 ? `${ hours }h ` : '';
			const formattedMinutes = minutes > 0 ? `${ minutes }m` : '';

			const time = `${ formattedDays }${ formattedHours }${ formattedMinutes }`;

			return translate( 'Downtime for %(time)s', {
				args: {
					time: time.trim(),
				},
				comment: '%(time) is the downtime, e.g. "2d 5h 30m", "5h 30m", "55m"',
			} ) as string;
		},
		[ translate ]
	);
};

export default useGetMonitorDowntimeText;

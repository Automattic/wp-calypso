import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { formatDowntimeDuration } from '../monitor-activity-summary';

const useGetMonitorDowntimeText = () => {
	const translate = useTranslate();

	return useCallback(
		( downtime: number | undefined ): string => {
			if ( ! downtime ) {
				return translate( 'Downtime' );
			}

			return translate( 'Downtime for %(time)s', {
				args: {
					time: formatDowntimeDuration( downtime ),
				},
				comment: '%(time) is the downtime, e.g. "2d 5h 30m", "5h 30m", "55m"',
			} ) as string;
		},
		[ translate ]
	);
};

export default useGetMonitorDowntimeText;

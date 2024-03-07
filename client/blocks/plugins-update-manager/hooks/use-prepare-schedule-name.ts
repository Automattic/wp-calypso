import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { ScheduleUpdates } from 'calypso/data/plugins/use-update-schedules-query';

export function usePrepareScheduleName() {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	function prepareScheduleName( schedule: ScheduleUpdates ) {
		const tm = moment( schedule.timestamp * 1000 );
		const translateArgs = { time: tm.format( 'LT' ) };

		if ( schedule.schedule === 'daily' ) {
			return translate( 'Daily at %(time)s', {
				args: translateArgs,
			} );
		} else if ( schedule.schedule === 'weekly' ) {
			switch ( tm.day() ) {
				case 0:
					return translate( 'Sundays at %(time)s', {
						args: translateArgs,
					} );
				case 1:
					return translate( 'Mondays at %(time)s', {
						args: translateArgs,
					} );
				case 2:
					return translate( 'Tuesdays at %(time)s', {
						args: translateArgs,
					} );
				case 3:
					return translate( 'Wednesdays at %(time)s', {
						args: translateArgs,
					} );
				case 4:
					return translate( 'Thursdays at %(time)s', {
						args: translateArgs,
					} );
				case 5:
					return translate( 'Fridays at %(time)s', {
						args: translateArgs,
					} );
				case 6:
					return translate( 'Saturdays at %(time)s', {
						args: translateArgs,
					} );
			}
		}

		return schedule?.hook || '';
	}
	return {
		prepareScheduleName,
	};
}

import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSiteSlug } from '../../plugins-scheduled-updates/hooks/use-site-slug';
import { useDateTimeFormat } from './use-date-time-format';
import type { ScheduleUpdates } from 'calypso/data/plugins/use-update-schedules-query';

export function usePrepareScheduleName() {
	const moment = useLocalizedMoment();
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { prepareTime } = useDateTimeFormat( siteSlug );

	function prepareScheduleName( schedule: ScheduleUpdates ) {
		const tm = moment( schedule.timestamp * 1000 );
		const translateArgs = { time: prepareTime( schedule.timestamp ) };

		if ( schedule.schedule === 'daily' ) {
			/* translators: Daily at 10 am. */
			return translate( 'Daily at %(time)s', {
				args: translateArgs,
			} );
		} else if ( schedule.schedule === 'weekly' ) {
			switch ( tm.day() ) {
				case 0:
					/* translators: Sundays at 10 am. */
					return translate( 'Sundays at %(time)s', {
						args: translateArgs,
					} );
				case 1:
					/* translators: Mondays at 10 am. */
					return translate( 'Mondays at %(time)s', {
						args: translateArgs,
					} );
				case 2:
					/* translators: Tuesdays at 10 am. */
					return translate( 'Tuesdays at %(time)s', {
						args: translateArgs,
					} );
				case 3:
					/* translators: Wednesdays at 10 am. */
					return translate( 'Wednesdays at %(time)s', {
						args: translateArgs,
					} );
				case 4:
					/* translators: Thursdays at 10 am. */
					return translate( 'Thursdays at %(time)s', {
						args: translateArgs,
					} );
				case 5:
					/* translators: Fridays at 10 am. */
					return translate( 'Fridays at %(time)s', {
						args: translateArgs,
					} );
				case 6:
					/* translators: Saturdays at 10 am. */
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

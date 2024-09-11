import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Moment } from 'moment';

type Props = {
	baseBackupDate: Moment;
	eventsCount: number;
	selectedBackupDate: Moment;
	learnMoreUrl?: string;
};

export const BackupRealtimeMessage: FunctionComponent< Props > = ( {
	baseBackupDate,
	eventsCount,
	selectedBackupDate,
	learnMoreUrl,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const onLearnMoreClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_realtime_message_learn_more_click' ) );
	}, [ dispatch ] );

	if (
		! moment.isMoment( baseBackupDate ) ||
		! moment.isMoment( selectedBackupDate ) ||
		eventsCount < 0
	) {
		return;
	}

	const today = applySiteOffset( moment(), {
		timezone: timezone,
		gmtOffset: gmtOffset,
	} );

	const isBackupFromToday = baseBackupDate.isSame( today, 'day' );
	const isBackupFromYesterday = baseBackupDate.isSame( today.subtract( 1, 'days' ), 'day' );
	const daysDiff = selectedBackupDate.diff( baseBackupDate, 'days' );
	let message: string | React.ReactNode;

	if ( daysDiff === 0 && isBackupFromToday ) {
		// Base backup date is the same as today's date
		message = translate(
			'We are using a full backup from today (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from today (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDate.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment: '%(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( daysDiff === 0 ) {
		// Base backup date is the same as the selected backup date
		message = translate(
			'We are using a full backup from this day (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from this day (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDate.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( daysDiff === 1 && isBackupFromYesterday ) {
		// Base backup date is the same as yesterday
		message = translate(
			'We are using a full backup from yesterday (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from yesterday (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDate.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( daysDiff === 1 ) {
		// Base backup date is the day before the selected backup date
		message = translate(
			'We are using a full backup from the previous day (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from the previous day (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDate.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else {
		// Base backup date is two or more days before the selected backup date
		message = translate(
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					daysAgo: daysDiff,
					baseBackupDate: baseBackupDate.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(daysAgo)d is the number of days since the backup, %(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	}

	return (
		<p>
			{ message }
			{ learnMoreUrl && (
				<>
					{ ' ' }
					<a href={ learnMoreUrl } onClick={ onLearnMoreClick }>
						{ translate( 'Learn more' ) }
					</a>
				</>
			) }
		</p>
	);
};

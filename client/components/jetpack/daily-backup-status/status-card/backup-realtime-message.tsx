import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Moment } from 'moment';

type Props = {
	baseBackupDate: Moment;
	eventsCount: number;
	selectedBackupDate: Moment;
};

export const BackupRealtimeMessage: FunctionComponent< Props > = ( {
	baseBackupDate,
	eventsCount,
	selectedBackupDate,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if (
		! moment.isMoment( baseBackupDate ) ||
		! moment.isMoment( selectedBackupDate ) ||
		eventsCount < 0
	) {
		return;
	}

	const daysDiff = selectedBackupDate.diff( baseBackupDate, 'days' );
	let message: string | React.ReactNode;

	if ( daysDiff === 0 ) {
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

	return <>{ message }</>;
};

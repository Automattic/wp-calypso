import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Moment } from 'moment';

type Props = {
	baseBackupDate: number; // timestamp
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
	const baseBackupDateMoment = moment( baseBackupDate );
	const today = selectedBackupDate;
	const daysAgo = selectedBackupDate.diff( baseBackupDate, 'days' );

	let message: string | React.ReactNode;

	if ( baseBackupDateMoment.isSame( today, 'day' ) ) {
		message = translate(
			'We are using a full backup from this day (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from this day (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( baseBackupDateMoment.isSame( today.clone().subtract( 1, 'days' ), 'day' ) ) {
		message = translate(
			'We are using a full backup from the previous day (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a full backup from the previous day (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					baseBackupDate: baseBackupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( daysAgo < 7 ) {
		message = translate(
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					daysAgo: daysAgo,
					baseBackupDate: baseBackupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(daysAgo)d is the number of days since the backup, %(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else {
		message = translate(
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a %(daysAgo)d-day old full backup (%(baseBackupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					daysAgo: daysAgo,
					baseBackupDate: baseBackupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(daysAgo)d is the number of days since the backup, %(baseBackupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	}

	return <>{ message }</>;
};

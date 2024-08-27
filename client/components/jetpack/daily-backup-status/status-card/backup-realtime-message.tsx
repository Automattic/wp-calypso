import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

type Props = {
	backupDate: number; // timestamp
	eventsCount: number;
};

export const BackupRealtimeMessage: FunctionComponent< Props > = ( {
	backupDate,
	eventsCount,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const backupDateMoment = moment( backupDate );
	const today = moment();
	const daysAgo = today.diff( backupDateMoment, 'days' );

	let message: string | React.ReactNode;

	if ( backupDateMoment.isSame( today, 'day' ) ) {
		message = translate(
			'We are using the full backup from today (%(backupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using the full backup from today (%(backupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					backupDate: backupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(backupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( backupDateMoment.isSame( today.clone().subtract( 1, 'days' ), 'day' ) ) {
		message = translate(
			'We are using the full backup from yesterday (%(backupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using the full backup from yesterday (%(backupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					backupDate: backupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(backupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else if ( daysAgo < 7 ) {
		message = translate(
			'We are using a %(daysAgo)d-day old full backup (%(backupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a %(daysAgo)d-day old full backup (%(backupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					daysAgo: daysAgo,
					backupDate: backupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(daysAgo)d is the number of days since the backup, %(backupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	} else {
		message = translate(
			'We are using a %(daysAgo)d-day old full backup (%(backupDate)s) with %(eventsCount)d change you have made since then until now.',
			'We are using a %(daysAgo)d-day old full backup (%(backupDate)s) with %(eventsCount)d changes you have made since then until now.',
			{
				count: eventsCount,
				args: {
					daysAgo: daysAgo,
					backupDate: backupDateMoment.format( 'YYYY-MM-DD hh:mm A' ),
					eventsCount: eventsCount,
				},
				comment:
					'%(daysAgo)d is the number of days since the backup, %(backupDate)s is the date and time of the backup, and %(eventsCount)d is the number of changes made since the backup.',
			}
		);
	}

	return <>{ message }</>;
};

import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import { useSiteLogsDownloader } from '../../hooks/use-site-logs-downloader';
import type { Moment } from 'moment';

import './style.scss';

const SiteLogsToolbarDownloadProgress = ( {
	recordsDownloaded = 0,
	totalRecordsAvailable = 0,
} ) => {
	const translate = useTranslate();

	if ( totalRecordsAvailable === 0 ) {
		return null;
	}

	return (
		<span className="site-logs-toolbar__download-progress">
			{ translate(
				'Download progress: %(logRecordsDownloaded)d of %(totalLogRecordsAvailable)d records',
				{
					args: {
						logRecordsDownloaded: recordsDownloaded,
						totalLogRecordsAvailable: totalRecordsAvailable,
					},
				}
			) }
		</span>
	);
};

type Props = {
	onRefresh: () => void;
	onDateTimeCommit?: ( startDate: Date, endDate: Date ) => void;
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
};

export const SiteLogsToolbar = ( {
	onRefresh,
	onDateTimeCommit,
	logType,
	startDateTime,
	endDateTime,
}: Props ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const { downloadLogs, state } = useSiteLogsDownloader();

	const isDownloading = state.status === 'downloading';

	const handleDateRangeCommit = ( startDate: Date, endDate: Date ) => {
		if ( ! startDate || ! endDate ) {
			return;
		}
		onDateTimeCommit?.( startDate, endDate );
	};

	return (
		<div className="site-logs-toolbar">
			<DateRange
				showTriggerClear={ false }
				selectedStartDate={ startDateTime.toDate() }
				selectedEndDate={ endDateTime.toDate() }
				lastSelectableDate={ moment().toDate() }
				dateFormat="ll @ HH:mm:ss"
				onDateCommit={ handleDateRangeCommit }
			/>

			<Button isSecondary onClick={ onRefresh }>
				{ translate( 'Refresh' ) }
			</Button>

			<Button
				disabled={ isDownloading }
				isBusy={ isDownloading }
				isPrimary
				onClick={ () => downloadLogs( { logType, startDateTime, endDateTime } ) }
			>
				{ translate( 'Download' ) }
			</Button>
			{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }
		</div>
	);
};

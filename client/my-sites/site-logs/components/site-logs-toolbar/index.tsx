import { Button, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
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
	autoRefresh: boolean;
	onAutoRefreshChange: ( isChecked: boolean ) => void;
	onDateTimeCommit?: ( startDate: Date, endDate: Date ) => void;
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
};

export const SiteLogsToolbar = ( {
	autoRefresh,
	onAutoRefreshChange,
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
		if ( startDateTime.isSame( startDate ) && endDateTime.isSame( endDate ) ) {
			return;
		}
		const url = new URL( window.location.href );
		const range = {
			from: moment( startDate ).utc().unix(),
			to: moment( endDate ).utc().unix(),
		};
		url.searchParams.set( 'range', JSON.stringify( range ) );
		page.replace( url.pathname + url.search );
		onDateTimeCommit?.( startDate, endDate );
	};

	return (
		<div className="site-logs-toolbar">
			<div className="site-logs-toolbar__top-row">
				<DateRange
					showTriggerClear={ false }
					selectedStartDate={ startDateTime.toDate() }
					selectedEndDate={ endDateTime.toDate() }
					lastSelectableDate={ moment().toDate() }
					dateFormat="ll @ HH:mm:ss"
					onDateCommit={ handleDateRangeCommit }
				/>

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
			<ToggleControl
				className="site-logs-toolbar__auto-refresh"
				label={ translate( 'Auto-refresh' ) }
				checked={ autoRefresh }
				onChange={ onAutoRefreshChange }
			/>
		</div>
	);
};

import { Button, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import { useSiteLogsDownloader } from '../../hooks/use-site-logs-downloader';
import { DateTimePicker } from './date-time-picker';
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
	onDateTimeChange: ( startDateTime: Moment, endDateTime: Moment ) => void;
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
};

export const SiteLogsToolbar = ( {
	autoRefresh,
	onAutoRefreshChange,
	onDateTimeChange,
	logType,
	startDateTime,
	endDateTime,
}: Props ) => {
	const translate = useTranslate();
	const { downloadLogs, state } = useSiteLogsDownloader();

	const isDownloading = state.status === 'downloading';

	const handleTimeRangeChange = ( newStart: Moment | null, newEnd: Moment | null ) => {
		if (
			( ! newStart && ! newEnd ) ||
			( startDateTime.isSame( newStart ) && endDateTime.isSame( newEnd ) )
		) {
			return;
		}

		onDateTimeChange( newStart || startDateTime, newEnd || endDateTime );
	};

	return (
		<div className="site-logs-toolbar">
			<div className="site-logs-toolbar__top-row">
				<label htmlFor="from">{ translate( 'From' ) }</label>
				<DateTimePicker
					id="from"
					value={ startDateTime }
					onChange={ ( value ) => handleTimeRangeChange( value, null ) }
				/>
				<label htmlFor="to">{ translate( 'To' ) }</label>
				<DateTimePicker
					id="to"
					value={ endDateTime }
					onChange={ ( value ) => handleTimeRangeChange( null, value ) }
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

import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
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
	onDateTimeChange: ( startDateTime: Moment, endDateTime: Moment ) => void;
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
};

export const SiteLogsToolbar = ( {
	onDateTimeChange,
	logType,
	startDateTime,
	endDateTime,
}: Props ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { downloadLogs, state } = useSiteLogsDownloader();
	const siteGmtOffset = useCurrentSiteGmtOffset();

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
					gmtOffset={ siteGmtOffset }
					min={ moment.unix( 0 ) } // The UI goes weird when the unix timestamps go negative, so don't allow it
					max={ endDateTime }
				/>
				<label htmlFor="to">{ translate( 'To' ) }</label>
				<DateTimePicker
					id="to"
					value={ endDateTime }
					onChange={ ( value ) => handleTimeRangeChange( null, value ) }
					gmtOffset={ siteGmtOffset }
					max={ moment() }
					min={ startDateTime }
				/>

				<Button
					disabled={ isDownloading }
					isBusy={ isDownloading }
					isPrimary
					onClick={ () => downloadLogs( { logType, startDateTime, endDateTime } ) }
				>
					{ translate( 'Download logs' ) }
				</Button>

				{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }
			</div>
		</div>
	);
};

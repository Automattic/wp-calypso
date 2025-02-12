import { Button } from '@wordpress/components';
import { translate, useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { buildFilterParam, LogType } from 'calypso/sites/tools/logs';
import { useSiteLogsDownloader } from 'calypso/sites/tools/logs/hooks/use-site-logs-downloader';
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

type SiteLogsHeaderProps = {
	endDateTime: Moment;
	logType: LogType;
	requestStatus: string;
	requestType: string;
	severity: string;
	startDateTime: Moment;
};

export function SiteLogsHeader( {
	endDateTime,
	logType,
	requestStatus,
	requestType,
	severity,
	startDateTime,
}: SiteLogsHeaderProps ) {
	const { downloadLogs, state } = useSiteLogsDownloader( { roundDateRangeToWholeDays: false } );
	const isDownloading = state.status === 'downloading';

	return (
		<div className="site-logs-header">
			<NavigationHeader
				title={ translate( 'Logs' ) }
				subtitle={ translate(
					'View and download various server logs. {{link}}Learn more{{/link}}',
					{
						components: {
							link: <InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />,
						},
					}
				) }
			/>

			<div className="site-logs-header__download-container">
				{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }

				<Button
					className="site-logs-toolbar__download"
					disabled={ isDownloading }
					isBusy={ isDownloading }
					variant="primary"
					onClick={ () =>
						downloadLogs( {
							logType,
							startDateTime,
							endDateTime,
							filter: buildFilterParam( logType, severity, requestType, requestStatus ),
						} )
					}
				>
					{ translate( 'Download logs' ) }
				</Button>
			</div>
		</div>
	);
}

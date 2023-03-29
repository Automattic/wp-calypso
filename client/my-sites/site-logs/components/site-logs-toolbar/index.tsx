import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Moment } from 'moment';
import { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import { useSiteLogsDownloader } from '../../hooks/use-site-logs-downloader';

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
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
};

export const SiteLogsToolbar = ( { onRefresh, ...downloadProps }: Props ) => {
	const translate = useTranslate();
	const { downloadLogs, state } = useSiteLogsDownloader();

	const isDownloading = state.status === 'downloading';

	return (
		<div className="site-logs-toolbar">
			<Button isSecondary onClick={ onRefresh }>
				{ translate( 'Refresh' ) }
			</Button>

			<Button
				disabled={ isDownloading }
				isBusy={ isDownloading }
				isPrimary
				onClick={ () => downloadLogs( downloadProps ) }
			>
				{ translate( 'Download' ) }
			</Button>
			{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }
		</div>
	);
};

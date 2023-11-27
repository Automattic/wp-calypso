import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import SelectDropdown from 'calypso/components/select-dropdown';
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
	onSeverityChange: ( severity: string ) => void;
	onRequestTypeChange: ( requestType: string ) => void;
	onRequestStatusChange: ( requestStatus: string ) => void;
	logType: SiteLogsTab;
	startDateTime: Moment;
	endDateTime: Moment;
	severity: string;
	requestType: string;
	requestStatus: string;
	children?: React.ReactNode;
};

export const SiteLogsToolbar = ( {
	onDateTimeChange,
	onSeverityChange,
	onRequestTypeChange,
	onRequestStatusChange,
	logType,
	startDateTime,
	endDateTime,
	severity,
	requestType,
	requestStatus,
	children,
}: Props ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { downloadLogs, state } = useSiteLogsDownloader( { roundDateRangeToWholeDays: false } );
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

	const severities = [
		{ value: '', label: translate( 'All' ) },
		{ value: 'User', label: translate( 'User' ) },
		{ value: 'Warning', label: translate( 'Warning' ) },
		{ value: 'Deprecated', label: translate( 'Deprecated' ) },
		{ value: 'Fatal error', label: translate( 'Fatal error' ) },
	];

	const requestTypes = [
		{ value: '', label: translate( 'All' ) },
		{ value: 'GET', label: translate( 'GET' ) },
		{ value: 'HEAD', label: translate( 'HEAD' ) },
		{ value: 'POST', label: translate( 'POST' ) },
		{ value: 'PUT', label: translate( 'PUT' ) },
		{ value: 'DELETE', label: translate( 'DELETE' ) },
	];

	const requestStatuses = [
		{ value: '', label: translate( 'All' ) },
		{ value: '200', label: translate( '200' ) },
		{ value: '404', label: translate( '404' ) },
	];

	const selectedSeverity =
		severities.find( ( item ) => severity === item.value ) || severities[ 0 ];

	const selectedRequestType =
		requestTypes.find( ( item ) => requestType === item.value ) || requestTypes[ 0 ];

	const selectedRequestStatus =
		requestStatuses.find( ( item ) => requestStatus === item.value ) || requestStatuses[ 0 ];

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
				{ logType === 'php' && (
					<div className="site-logs-toolbar-filter-element">
						<label htmlFor="site-logs-severity">{ translate( 'Severity' ) }</label>
						<SelectDropdown
							id="site-logs-severity"
							className="site-logs-toolbar-filter-severity"
							selectedText={ selectedSeverity.label }
							initialSelected={ severity }
						>
							{ severities.map( ( option ) => (
								<SelectDropdown.Item
									key={ option.value }
									onClick={ () => onSeverityChange( option.value ) }
								>
									<span>
										<strong>{ option.label }</strong>
									</span>
								</SelectDropdown.Item>
							) ) }
						</SelectDropdown>
					</div>
				) }
				{ logType === 'web' && (
					<>
						<div className="site-logs-toolbar-filter-element">
							<label htmlFor="site-logs-request-type">{ translate( 'Request Type' ) }</label>
							<SelectDropdown
								id="site-logs-request-type"
								className="site-logs-toolbar-filter-request-type"
								selectedText={ selectedRequestType.label }
								initialSelected={ requestType }
							>
								{ requestTypes.map( ( option ) => (
									<SelectDropdown.Item
										key={ option.value }
										onClick={ () => onRequestTypeChange( option.value ) }
									>
										<span>
											<strong>{ option.label }</strong>
										</span>
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</div>
						<div className="site-logs-toolbar-filter-element">
							<label htmlFor="site-logs-request-status">{ translate( 'Status' ) }</label>
							<SelectDropdown
								id="site-logs-request-status"
								className="site-logs-toolbar-filter-request-status"
								selectedText={ selectedRequestStatus.label }
								initialSelected={ requestStatus }
							>
								{ requestStatuses.map( ( option ) => (
									<SelectDropdown.Item
										key={ option.value }
										onClick={ () => onRequestStatusChange( option.value ) }
									>
										<span>
											<strong>{ option.label }</strong>
										</span>
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</div>
					</>
				) }

				<Button
					disabled={ isDownloading }
					isBusy={ isDownloading }
					variant="primary"
					onClick={ () => downloadLogs( { logType, startDateTime, endDateTime } ) }
				>
					{ translate( 'Download logs' ) }
				</Button>

				{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }
			</div>
			{ children }
		</div>
	);
};

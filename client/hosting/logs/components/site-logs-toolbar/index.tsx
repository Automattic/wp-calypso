import { SelectDropdown, Gridicon, Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsTab } from 'calypso/data/hosting/use-site-logs-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
import { useSiteLogsDownloader } from '../../hooks/use-site-logs-downloader';
import { buildFilterParam } from '../site-logs';
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
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const { downloadLogs, state } = useSiteLogsDownloader( { roundDateRangeToWholeDays: false } );
	const siteGmtOffset = useCurrentSiteGmtOffset();

	const isDownloading = state.status === 'downloading';
	const [ isMobileOpen, setIsMobileOpen ] = useState( false );

	const handleTimeRangeChange = ( newStart: Moment | null, newEnd: Moment | null ) => {
		if (
			( ! newStart && ! newEnd ) ||
			( startDateTime.isSame( newStart ) && endDateTime.isSame( newEnd ) )
		) {
			return;
		}
		setIsMobileOpen( false );
		onDateTimeChange( newStart || startDateTime, newEnd || endDateTime );
	};

	const recordSeverityChange = ( severity: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_site_logs_severity_filter', {
				severity,
			} )
		);
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

	// Numbers don't need to be translated.
	const requestStatuses = [
		{ value: '', label: translate( 'All' ) },
		{ value: '200', label: '200' },
		{ value: '301', label: '301' },
		{ value: '302', label: '302' },
		{ value: '400', label: '400' },
		{ value: '401', label: '401' },
		{ value: '403', label: '403' },
		{ value: '404', label: '404' },
		{ value: '429', label: '429' },
		{ value: '500', label: '500' },
	];

	const selectedSeverity =
		severities.find( ( item ) => severity === item.value ) || severities[ 0 ];

	const selectedRequestType =
		requestTypes.find( ( item ) => requestType === item.value ) || requestTypes[ 0 ];

	const selectedRequestStatus =
		requestStatuses.find( ( item ) => requestStatus === item.value ) || requestStatuses[ 0 ];

	return (
		<div className="site-logs-toolbar">
			<Button
				className="site-logs-toolbar__filter"
				onClick={ () => {
					setIsMobileOpen( ! isMobileOpen );
				} }
			>
				{ ( severity || requestType || requestStatus ) && (
					<Badge className="site-logs-toolbar__badge" type="success"></Badge>
				) }
				{ translate( 'Filter' ) }
				<Gridicon icon="filter" />
			</Button>
			<div className={ clsx( 'site-logs-toolbar__top-row', { 'is-hidden': ! isMobileOpen } ) }>
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
									onClick={ () => {
										recordSeverityChange( option.value );
										onSeverityChange( option.value );
										setIsMobileOpen( false );
									} }
									ariaLabel={ option.label }
									selected={ option.value === severity }
								>
									{ option.label }
								</SelectDropdown.Item>
							) ) }
						</SelectDropdown>
					</div>
				) }
				{ logType === 'web' && (
					<>
						<div className="site-logs-toolbar-filter-element">
							<label htmlFor="site-logs-request-type">{ translate( 'Request type' ) }</label>
							<SelectDropdown
								id="site-logs-request-type"
								className="site-logs-toolbar-filter-request-type"
								selectedText={ selectedRequestType.label }
								initialSelected={ requestType }
							>
								{ requestTypes.map( ( option ) => (
									<SelectDropdown.Item
										key={ option.value }
										onClick={ () => {
											onRequestTypeChange( option.value );
											setIsMobileOpen( false );
										} }
										ariaLabel={ option.label }
										selected={ option.value === requestType }
									>
										{ option.label }
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
										onClick={ () => {
											onRequestStatusChange( option.value );
											setIsMobileOpen( false );
										} }
										ariaLabel={ option.label }
										selected={ option.value === requestStatus }
									>
										{ option.label }
									</SelectDropdown.Item>
								) ) }
							</SelectDropdown>
						</div>
					</>
				) }

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

				{ isDownloading && <SiteLogsToolbarDownloadProgress { ...state } /> }
			</div>
			{ children }
		</div>
	);
};

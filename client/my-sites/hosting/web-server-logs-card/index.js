/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import { get, isEmpty, map } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card, ProgressBar } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import FormLabel from 'calypso/components/forms/form-label';
import MaterialIcon from 'calypso/components/material-icon';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { isAtomicSiteLogAccessEnabled } from 'calypso/state/selectors/is-atomic-site-log-access-enabled';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const WebServerLogsCard = ( props ) => {
	const {
		successNotice: downloadSuccessNotice,
		errorNotice: downloadErrorNotice,
		siteId,
		siteSlug,
		translate,
		isAtomicSiteLogAccessEnabled: siteLogsEnabled,
		atomicLogsDownloadStarted: recordDownloadStarted,
		atomicLogsDownloadCompleted: recordDownloadCompleted,
		atomicLogsDownloadError: recordDownloadError,
	} = props;
	const now = moment.utc();
	const oneHourAgo = now.clone().subtract( 1, 'hour' );
	const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
	const [ startDateTime, setStartDateTime ] = useState( oneHourAgo.format( dateTimeFormat ) );
	const [ endDateTime, setEndDateTime ] = useState( now.format( dateTimeFormat ) );
	const [ downloading, setDownloading ] = useState( false );
	const [ downloadErrorOccurred, setDownloadErrorOccurred ] = useState( false );
	const [ progress, setProgress ] = useState( { recordsDownloaded: 0, totalRecordsAvailable: 0 } );
	const [ showProgress, setShowProgress ] = useState( false );
	const [ startDateValidation, setStartDateValidation ] = useState( {
		isValid: true,
		validationInfo: '',
	} );
	const [ endDateValidation, setEndDateValidation ] = useState( {
		isValid: true,
		validationInfo: '',
	} );

	useEffect( () => {
		const startMoment = moment.utc( startDateTime );
		const endMoment = moment.utc( endDateTime );

		const startDateIsValid =
			startMoment.isValid() && startDateTime === startMoment.format( dateTimeFormat );
		const endDateIsValid =
			endMoment.isValid() && endDateTime === endMoment.format( dateTimeFormat );

		setStartDateValidation( {
			isValid: startDateIsValid,
			validationInfo: startDateIsValid
				? translate( 'Date is valid' )
				: translate( 'Start date format is not valid.' ),
		} );

		setEndDateValidation( {
			isValid: endDateIsValid,
			validationInfo: endDateIsValid
				? translate( 'Date is valid' )
				: translate( 'End date format is not valid.' ),
		} );

		if ( ! startDateIsValid || ! endDateIsValid ) {
			return;
		}

		if ( ! startMoment.isBefore( endMoment ) ) {
			setStartDateValidation( {
				isValid: false,
				validationInfo: translate( 'Start date must be earlier than end date.' ),
			} );
		}

		if ( startMoment.isBefore( moment.utc().subtract( 14, 'days' ) ) ) {
			setStartDateValidation( {
				isValid: false,
				validationInfo: translate( 'Start date must be less than 14 days ago.' ),
			} );
		}
	}, [ startDateTime, endDateTime ] );

	const updateStartDateTime = ( event ) => {
		setStartDateTime( event.target.value );
	};

	const updateEndDateTime = ( event ) => {
		setEndDateTime( event.target.value );
	};

	const downloadLogs = async () => {
		setShowProgress( true );
		setDownloading( true );
		setProgress( { recordsDownloaded: 0, totalRecordsAvailable: 0 } );
		setDownloadErrorOccurred( false );

		const startMoment = moment.utc( startDateTime );
		const endMoment = moment.utc( endDateTime );

		const dateFormat = 'YYYYMMDDHHmmss';
		const startString = startMoment.format( dateFormat );
		const endString = endMoment.format( dateFormat );

		const startTime = startMoment.unix();
		const endTime = endMoment.unix();

		const tracksProps = {
			site_slug: siteSlug,
			site_id: siteId,
			start_time: startMoment.format( dateTimeFormat ),
			end_time: endMoment.format( dateTimeFormat ),
		};

		recordDownloadStarted( tracksProps );

		let scrollId = null;
		let logs = [];
		let logFile = new Blob();
		let totalLogs = 0;
		let isError = false;

		do {
			await wpcom
				.undocumented()
				.getAtomicSiteLogs( siteId, startTime, endTime, scrollId )
				.then( ( response ) => {
					const newLogData = get( response, 'data.logs', [] );
					scrollId = get( response, 'data.scroll_id', null );

					if ( isEmpty( logs ) ) {
						if ( isEmpty( newLogData ) ) {
							downloadErrorNotice( translate( 'No logs available for this time range' ) );
							isError = true;
						} else {
							logs = [ Object.keys( newLogData[ 0 ] ).join( ',' ) + '\n' ];
							totalLogs = get( response, 'data.total_results', 1 );
						}
					}

					logs = [
						...logs,
						...map( newLogData, ( entry ) => {
							return Object.values( entry ).join( ',' ) + '\n';
						} ),
					];

					setProgress( { recordsDownloaded: logs.length - 1, totalRecordsAvailable: totalLogs } );
				} )
				.catch( ( error ) => {
					isError = true;
					const message = get( error, 'message', 'Could not retrieve logs.' );
					downloadErrorNotice( message );
					recordDownloadError( {
						error_message: message,
						...tracksProps,
					} );
				} );
		} while ( null !== scrollId );

		setDownloading( false );

		if ( isError ) {
			setDownloadErrorOccurred( true );
			return;
		}

		logFile = new Blob( logs );

		const url = window.URL.createObjectURL( logFile );
		const link = document.createElement( 'a' );
		const downloadFilename = siteSlug + '-' + startString + '-' + endString + '.csv';
		link.href = url;
		link.setAttribute( 'download', downloadFilename );
		link.click();
		window.URL.revokeObjectURL( url );

		downloadSuccessNotice( 'Logs downloaded successfully.' );
		recordDownloadCompleted( {
			download_filename: downloadFilename,
			total_log_records_downloaded: totalLogs,
			...tracksProps,
		} );
	};

	const renderDownloadProgress = () => {
		if ( ! showProgress ) {
			return;
		}

		let progressMessage = translate( 'Download progress: starting download…' );

		if ( downloadErrorOccurred ) {
			progressMessage = translate( 'Download progress: an error occurred' );
		} else if ( 0 !== progress.totalRecordsAvailable ) {
			progressMessage = translate(
				'Download progress: %(logRecordsDownloaded)d of %(totalLogRecordsAvailable)d records',
				{
					args: {
						logRecordsDownloaded: progress.recordsDownloaded,
						totalLogRecordsAvailable: progress.totalRecordsAvailable,
					},
				}
			);
		}

		return (
			<div>
				<span>{ progressMessage }</span>
				<ProgressBar
					value={ progress.recordsDownloaded }
					total={ progress.totalRecordsAvailable }
					isPulsing={ downloading }
					canGoBackwards={ true }
				/>
			</div>
		);
	};

	const getContent = () => {
		return (
			<>
				<p className="web-server-logs-card__info">
					{ translate(
						'To help troubleshoot or debug problems with your site, you may download web server logs between the following dates.'
					) }
				</p>
				<div className="web-server-logs-card__dates">
					<div className="web-server-logs-card__start">
						<FormFieldset>
							<FormLabel>{ translate( 'Log Start:' ) }</FormLabel>
							<FormTextInput
								value={ startDateTime }
								onChange={ updateStartDateTime }
								isValid={ startDateValidation.isValid }
								isError={ ! startDateValidation.isValid }
							/>
							<FormInputValidation
								isError={ ! startDateValidation.isValid }
								text={ startDateValidation.validationInfo }
							/>
						</FormFieldset>
					</div>
					<div className="web-server-logs-card__end">
						<FormFieldset>
							<FormLabel>{ translate( 'Log End:' ) }</FormLabel>
							<FormTextInput
								value={ endDateTime }
								onChange={ updateEndDateTime }
								isValid={ endDateValidation.isValid }
								isError={ ! endDateValidation.isValid }
							/>
							<FormInputValidation
								isError={ ! endDateValidation.isValid }
								text={ endDateValidation.validationInfo }
							/>
						</FormFieldset>
					</div>
				</div>
				<p className="web-server-logs-card__info">
					{ translate( 'Note: Please specify times as YYYY-MM-DD HH:MM:SS in UTC.' ) }
				</p>
				<div className="web-server-logs-card__download">
					{ renderDownloadProgress() }
					<Button
						primary
						disabled={ downloading || ! startDateValidation.isValid || ! endDateValidation.isValid }
						onClick={ downloadLogs }
					>
						Download Logs
					</Button>
				</div>
			</>
		);
	};

	if ( ! siteLogsEnabled ) {
		return null;
	}

	return (
		<Card className="web-server-logs-card">
			<MaterialIcon icon="settings" size={ 32 } />
			<CardHeading>{ translate( 'Download Web Server Logs' ) }</CardHeading>
			{ getContent() }
		</Card>
	);
};

export const atomicLogsDownloadStarted = ( props ) =>
	recordTracksEvent( 'calypso_atomic_logs_download_started', props );

export const atomicLogsDownloadCompleted = ( props ) =>
	recordTracksEvent( 'calypso_atomic_logs_download_completed', props );

export const atomicLogsDownloadError = ( props ) =>
	recordTracksEvent( 'calypso_atomic_logs_download_error', props );

export default connect(
	( state ) => {
		return {
			siteId: getSelectedSiteId( state ),
			siteSlug: getSelectedSiteSlug( state ),
			isAtomicSiteLogAccessEnabled: isAtomicSiteLogAccessEnabled( state ),
		};
	},
	{
		atomicLogsDownloadStarted,
		atomicLogsDownloadCompleted,
		atomicLogsDownloadError,
		successNotice,
		errorNotice,
	}
)( localize( WebServerLogsCard ) );

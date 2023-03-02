import { Button, Card, FormInputValidation, ProgressBar } from '@automattic/components';
import { localize, useTranslate } from 'i18n-calypso';
import { get, isEmpty, map } from 'lodash';
import { useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import CardHeading from 'calypso/components/card-heading';
import DateRange from 'calypso/components/date-range';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import MaterialIcon from 'calypso/components/material-icon';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const DateRangeInputsWithValidation = ( {
	onInputFocus = noop,
	onInputBlur = noop,
	onInputChange = noop,
	startValidationInfo,
	endValidationInfo,
	onValidate,
	...props
} ) => {
	const moment = useLocalizedMoment();
	const showValidation =
		typeof onValidate === 'function' && startValidationInfo && endValidationInfo;
	const uniqueIdRef = useRef( uuidv4() );
	const uniqueId = uniqueIdRef.current;
	const translate = useTranslate();

	const startDateID = `startDate-${ uniqueId }`;
	const endDateID = `endDate-${ uniqueId }`;

	// => "MM/DD/YYYY" (or locale equivalent)
	const localeDateFormat = moment.localeData().longDateFormat( 'L' );

	// If we haven't received a actual date then don't show anything and utilise the placeholder
	// as it is supposed to be used
	const startValue = props.startDateValue !== localeDateFormat ? props.startDateValue : '';
	const endValue = props.endDateValue !== localeDateFormat ? props.endDateValue : '';

	const validate = useCallback(
		( startOrEnd, newValue ) => {
			let validationResults = null;
			if ( startOrEnd === 'Start' ) {
				validationResults = onValidate( newValue, endValue );
			}
			if ( startOrEnd === 'End' ) {
				validationResults = onValidate( startValue, newValue );
			}
			if ( ! validationResults || ! Array.isArray( validationResults ) ) {
				return null;
			}
			return validationResults;
		},
		[ endValue, startValue, onValidate ]
	);

	/**
	 * Handles input focus events with fixed arguments
	 * for consistency via partial application
	 *
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputFocus = useCallback(
		( startOrEnd ) => ( e ) => {
			const { value } = e.target;
			if ( ! showValidation ) {
				return onInputFocus( value, startOrEnd );
			}
			const validationResults = validate( startOrEnd, value );
			if ( ! validationResults ) {
				return onInputFocus( value, startOrEnd );
			}
			const [ startValidatorResults, endValidatorResults ] = validationResults;
			if (
				( startOrEnd === 'Start' && startValidatorResults.isValid ) ||
				( startOrEnd === 'End' && endValidatorResults.isValid )
			) {
				return onInputFocus( value, startOrEnd );
			}
		},
		[ onInputFocus, validate, showValidation ]
	);

	/**
	 * Handles input blur events with fixed arguments
	 * for consistency via partial application
	 *
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputBlur = useCallback(
		( startOrEnd ) => ( e ) => {
			const { value } = e.target;
			if ( ! showValidation ) {
				return onInputBlur( value, startOrEnd );
			}
			const validationResults = validate( startOrEnd, value );
			if ( ! validationResults || validationResults.isValid ) {
				onInputBlur( value, startOrEnd );
			}

			if ( ! validationResults ) {
				return onInputBlur( value, startOrEnd );
			}
			const [ startValidatorResults, endValidatorResults ] = validationResults;
			if (
				( startOrEnd === 'Start' && startValidatorResults.isValid ) ||
				( startOrEnd === 'End' && endValidatorResults.isValid )
			) {
				return onInputBlur( value, startOrEnd );
			}
		},
		[ onInputBlur, validate, showValidation ]
	);

	/**
	 * Handles input change events with fixed arguments
	 * for consistency via partial application
	 *
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputChange = useCallback(
		( startOrEnd ) => ( e ) => {
			const { value } = e.target;
			if ( showValidation ) {
				validate( startOrEnd, value );
			}
			onInputChange( value, startOrEnd );
		},
		[ onInputChange, validate, showValidation ]
	);

	return (
		<FormFieldset className="date-range__date-inputs">
			<legend className="date-range__date-inputs-legend">
				{ translate( 'Start and end dates' ) }
			</legend>
			<div className="date-range__date-inputs-inner">
				<div className="date-range__date-input date-range__date-input--from">
					<FormLabel htmlFor={ startDateID }>
						{ props.startLabel ||
							translate( 'From', {
								comment: 'DateRange text input label for the start of the date range',
							} ) }
					</FormLabel>
					<FormTextInput
						id={ startDateID }
						name={ startDateID }
						value={ startValue }
						isValid={ startValidationInfo.isValid }
						isError={ ! startValidationInfo.isValid }
						onChange={ handleInputChange( 'Start' ) }
						onBlur={ handleInputBlur( 'Start' ) }
						onFocus={ handleInputFocus( 'Start' ) }
						placeholder={ localeDateFormat }
					/>
					{ showValidation && (
						<FormInputValidation
							isError={ ! startValidationInfo.isValid }
							text={ startValidationInfo.validationInfo }
						/>
					) }
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor={ endDateID }>
						{ props.startLabel ||
							translate( 'To', {
								comment: 'DateRange text input label for the end of the date range',
							} ) }
					</FormLabel>
					<FormTextInput
						id={ endDateID }
						name={ endDateID }
						value={ endValue }
						isValid={ endValidationInfo.isValid }
						isError={ ! endValidationInfo.isValid }
						onChange={ handleInputChange( 'End' ) }
						onBlur={ handleInputBlur( 'End' ) }
						onFocus={ handleInputFocus( 'End' ) }
						placeholder={ localeDateFormat }
					/>
					{ showValidation && (
						<FormInputValidation
							isError={ ! endValidationInfo.isValid }
							text={ endValidationInfo.validationInfo }
						/>
					) }
				</div>
			</div>
		</FormFieldset>
	);
};

const WebServerLogsCard = ( props ) => {
	const {
		successNotice: downloadSuccessNotice,
		errorNotice: downloadErrorNotice,
		siteId,
		siteSlug,
		translate,
		atomicLogsDownloadStarted: recordDownloadStarted,
		atomicLogsDownloadCompleted: recordDownloadCompleted,
		atomicLogsDownloadError: recordDownloadError,
	} = props;
	const moment = useLocalizedMoment();
	const now = moment();
	const localeDateFormat = moment.localeData().longDateFormat( 'L' );
	const initialStartDate = now.clone().startOf( 'day' ).add( 1, 'day' ).subtract( 1, 'week' );
	const initialEndDate = now.clone().endOf( 'day' );
	// First selectable date is 2 weeks (14 days) before the initial end date
	// eg if end date is 2023-02-28 29:59:59, the first selectable date is 2023-02-15 00:00:00
	const firstSelectableDate = initialStartDate.clone().subtract( 1, 'week' );
	const [ startDateTime, setStartDateTime ] = useState( initialStartDate );
	const [ endDateTime, setEndDateTime ] = useState( initialEndDate );
	const [ logType, setLogType ] = useState( 'php' );
	const [ downloading, setDownloading ] = useState( false );
	const [ downloadErrorOccurred, setDownloadErrorOccurred ] = useState( false );
	const [ progress, setProgress ] = useState( { recordsDownloaded: 0, totalRecordsAvailable: 0 } );
	const [ showProgress, setShowProgress ] = useState( false );
	const [ startDateValidation, setStartDateValidation ] = useState( {
		isValid: true,
		validationInfo: translate( 'Date is valid' ),
	} );
	const [ endDateValidation, setEndDateValidation ] = useState( {
		isValid: true,
		validationInfo: translate( 'Date is valid' ),
	} );

	const logTypes = [
		{
			label: translate( 'PHP error logs' ),
			value: 'php',
		},
		{
			label: translate( 'Web request logs' ),
			value: 'web',
		},
	];

	const onValidateInputs = useCallback(
		( start, end ) => {
			const startMoment = moment( start, localeDateFormat );
			const endMoment = moment( end, localeDateFormat );
			const startDateIsValid = startMoment.isValid();
			const endDateIsValid = endMoment.isValid();

			let startValidatorResults = {
				isValid: startDateIsValid,
				validationInfo: startDateIsValid
					? translate( 'Date is valid' )
					: translate( 'Start date format is not valid.' ),
			};

			const endValidatorResults = {
				isValid: endDateIsValid,
				validationInfo: endDateIsValid
					? translate( 'Date is valid' )
					: translate( 'End date format is not valid.' ),
			};

			if ( ! startDateIsValid || ! endDateIsValid ) {
				setStartDateValidation( startValidatorResults );
				setEndDateValidation( endValidatorResults );
				return [ startValidatorResults, endValidatorResults ];
			}

			if ( startMoment.isAfter( endMoment ) ) {
				startValidatorResults = {
					isValid: false,
					validationInfo: translate( 'Start date must be earlier than end date.' ),
				};
			}

			if ( startMoment.isBefore( firstSelectableDate ) ) {
				startValidatorResults = {
					isValid: false,
					validationInfo: translate( 'Start date must be less than 14 days ago.' ),
				};
			}

			setStartDateValidation( startValidatorResults );
			setEndDateValidation( endValidatorResults );
			return [ startValidatorResults, endValidatorResults ];
		},
		[ translate, moment, localeDateFormat, firstSelectableDate ]
	);

	const updateStartEndTime = ( start, end ) => {
		onValidateInputs( start, end );
		setStartDateTime( start );
		setEndDateTime( end );
	};

	const downloadLogs = async () => {
		setShowProgress( true );
		setDownloading( true );
		setProgress( { recordsDownloaded: 0, totalRecordsAvailable: 0 } );
		setDownloadErrorOccurred( false );

		let path = null;
		if ( logType === 'php' ) {
			path = `/sites/${ siteId }/hosting/error-logs`;
		} else if ( logType === 'web' ) {
			path = `/sites/${ siteId }/hosting/logs`;
		} else {
			downloadErrorNotice( translate( 'Invalid log type specified' ) );
			setDownloadErrorOccurred( true );
			return;
		}

		const startMoment = moment.utc( startDateTime, localeDateFormat ).startOf( 'day' );
		const endMoment = moment.utc( endDateTime, localeDateFormat ).endOf( 'day' );

		const dateFormat = 'YYYYMMDDHHmmss';
		const startString = startMoment.format( dateFormat );
		const endString = endMoment.format( dateFormat );

		const startTime = startMoment.unix();
		const endTime = endMoment.unix();

		const trackDateFormat = 'YYYY/MM/DD';
		const tracksProps = {
			site_slug: siteSlug,
			site_id: siteId,
			start_time: startMoment.format( trackDateFormat ),
			end_time: endMoment.format( trackDateFormat ),
			log_type: logType,
		};

		recordDownloadStarted( tracksProps );

		let scrollId = null;
		let logs = [];
		let logFile = new Blob();
		let totalLogs = 0;
		let isError = false;

		do {
			await wpcom.req
				.post(
					{
						path,
						apiNamespace: 'wpcom/v2',
					},
					{
						start: startTime,
						end: endTime,
						page_size: 10000,
						scroll_id: scrollId,
					}
				)
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
		const downloadFilename =
			siteSlug + '-' + logType + '-logs-' + startString + '-' + endString + '.csv';
		link.href = url;
		link.setAttribute( 'download', downloadFilename );
		link.click();
		window.URL.revokeObjectURL( url );

		downloadSuccessNotice( translate( 'Logs downloaded.' ) );
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
						'Download web server logs to troubleshoot or debug problems with your site.'
					) }
				</p>
				<div className="web-server-logs-card__type">
					<FormFieldset>
						<FormLabel>{ translate( 'Log type:' ) }</FormLabel>
						<FormRadiosBar
							items={ logTypes }
							checked={ logType }
							onChange={ ( event ) => setLogType( event.target.value ) }
						/>
					</FormFieldset>
				</div>
				<div className="web-server-logs-card__dates">
					<div className="web-server-logs-card__dates">
						<DateRange
							moment={ moment }
							firstSelectableDate={ firstSelectableDate }
							showTriggerClear={ false }
							onDateCommit={ updateStartEndTime }
							selectedStartDate={ startDateTime }
							selectedEndDate={ endDateTime }
							renderInputs={ ( renderProps ) => (
								<DateRangeInputsWithValidation
									startValidationInfo={ startDateValidation }
									endValidationInfo={ endDateValidation }
									onValidate={ onValidateInputs }
									{ ...renderProps }
								/>
							) }
						/>
					</div>
				</div>
				<div className="web-server-logs-card__download">
					{ renderDownloadProgress() }
					<Button
						primary
						disabled={ downloading || ! startDateValidation.isValid || ! endDateValidation.isValid }
						onClick={ downloadLogs }
					>
						{ translate( 'Download logs' ) }
					</Button>
				</div>
			</>
		);
	};

	return (
		<Card className="web-server-logs-card">
			<MaterialIcon icon="settings" size={ 32 } />
			<CardHeading id="web-server-logs">{ translate( 'Web server logs' ) }</CardHeading>
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

import { Button, Card, FormInputValidation, ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CardHeading from 'calypso/components/card-heading';
import DateRange from 'calypso/components/date-range';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import MaterialIcon from 'calypso/components/material-icon';
import { useSiteLogsDownloader } from 'calypso/my-sites/site-logs/hooks/use-site-logs-downloader';

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
							ariaLabel={ translate( 'Start date input validation' ) }
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
							ariaLabel={ translate( 'End date input validation' ) }
							isError={ ! endValidationInfo.isValid }
							text={ endValidationInfo.validationInfo }
						/>
					) }
				</div>
			</div>
		</FormFieldset>
	);
};

export const WebServerLogsCard = () => {
	const translate = useTranslate();
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

	const { downloadLogs, state } = useSiteLogsDownloader();

	const renderDownloadProgress = () => {
		if ( state.status === 'idle' ) {
			return;
		}

		let progressMessage = translate( 'Download progress: starting download…' );

		if ( state.status === 'error' ) {
			progressMessage = translate( 'Download progress: an error occurred' );
		} else if ( 0 !== state.totalRecordsAvailable ) {
			progressMessage = translate(
				'Download progress: %(logRecordsDownloaded)d of %(totalLogRecordsAvailable)d records',
				{
					args: {
						logRecordsDownloaded: state.recordsDownloaded,
						totalLogRecordsAvailable: state.totalRecordsAvailable,
					},
				}
			);
		}

		return (
			<div>
				<span>{ progressMessage }</span>
				<ProgressBar
					value={ state.recordsDownloaded }
					total={ state.totalRecordsAvailable }
					isPulsing={ state.status === 'downloading' }
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
							translate={ translate }
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
						disabled={
							state.status === 'downloading' ||
							! startDateValidation.isValid ||
							! endDateValidation.isValid
						}
						onClick={ () => downloadLogs( { logType, startDateTime, endDateTime } ) }
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

export default WebServerLogsCard;

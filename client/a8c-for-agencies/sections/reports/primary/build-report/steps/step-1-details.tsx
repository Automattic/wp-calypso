import {
	CheckboxControl,
	DatePicker,
	Popover,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import A4ASelectSite from 'calypso/a8c-for-agencies/components/a4a-select-site';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { formatDate } from '../../../lib/format-date';
import { getAvailableTimeframes } from '../../../lib/timeframes';
import type { StepProps } from './types';
import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

export default function Step1Details( { formData, state, handlers }: StepProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isStartDatePickerOpen, setIsStartDatePickerOpen ] = useState( false );
	const [ isEndDatePickerOpen, setIsEndDatePickerOpen ] = useState( false );

	const {
		selectedSite,
		selectedTimeframe,
		startDate,
		endDate,
		clientEmail,
		sendCopyToTeam,
		teammateEmails,
	} = formData;

	const { isDuplicateLoading, sendReportMutation, showValidationErrors, validationErrors } = state;

	const {
		setSelectedSite,
		setSelectedTimeframe,
		setStartDate,
		setEndDate,
		setClientEmail,
		setSendCopyToTeam,
		setTeammateEmails,
	} = handlers;

	const getFieldError = useCallback(
		( fieldName: string ): string | undefined => {
			if ( ! showValidationErrors ) {
				return undefined;
			}
			return validationErrors.find( ( error ) => error.field === fieldName )?.message;
		},
		[ showValidationErrors, validationErrors ]
	);

	const hasFieldError = useCallback(
		( fieldName: string ): boolean => {
			return (
				showValidationErrors && validationErrors.some( ( error ) => error.field === fieldName )
			);
		},
		[ showValidationErrors, validationErrors ]
	);

	const isCreatingReport = sendReportMutation.isPending;
	const isLoadingState = isDuplicateLoading || isCreatingReport;

	const availableTimeframes = getAvailableTimeframes( translate );

	return (
		<>
			<h2 className="build-report__step-title" aria-current="step">
				{ translate( 'Step 1 of 3: Enter report details' ) }
			</h2>

			<div className="build-report__field">
				<A4ASelectSite
					isDisabled={ isLoadingState }
					selectedSiteId={ selectedSite?.blogId }
					onSiteSelect={ ( site: A4ASelectSiteItem ) => {
						dispatch( recordTracksEvent( 'calypso_a4a_reports_select_site_button_click' ) );
						setSelectedSite( site );
					} }
					buttonLabel={ selectedSite?.domain || translate( 'Choose a site to report on' ) }
					trackingEvent="calypso_a4a_reports_select_site_button_click"
					data-field="selectedSite"
					aria-required="true"
					aria-describedby="selected-site-error"
				/>
				{ hasFieldError( 'selectedSite' ) && (
					<div
						role="alert"
						id="selected-site-error"
						aria-live="polite"
						className="build-report__error-message"
					>
						{ getFieldError( 'selectedSite' ) }
					</div>
				) }
			</div>

			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ translate( 'Report date range' ) }
				value={ selectedTimeframe }
				options={ availableTimeframes }
				onChange={ ( value ) => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_reports_timeframe_select', { timeframe: value } )
					);
					setSelectedTimeframe( value );
				} }
				disabled={ isLoadingState }
			/>

			{ selectedTimeframe === 'custom' && (
				<div className="build-report__date-fields-container">
					<div className="build-report__date-field">
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							id="start-date"
							label={ translate( 'Start date' ) }
							aria-label={ translate( 'Start date' ) }
							value={ formatDate( startDate ) }
							placeholder={ translate( 'Select start date' ) }
							onChange={ () => {} }
							onClick={ () => setIsStartDatePickerOpen( true ) }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' || event.key === ' ' ) {
									event.preventDefault();
									setIsStartDatePickerOpen( true );
								}
							} }
							readOnly
							className="build-report__date-input"
							role="button"
							aria-expanded={ isStartDatePickerOpen }
							aria-haspopup="dialog"
						/>
						{ isStartDatePickerOpen && (
							<Popover
								onClose={ () => setIsStartDatePickerOpen( false ) }
								placement="bottom-start"
								className="build-report__date-popover"
								onFocusOutside={ () => setIsStartDatePickerOpen( false ) }
								role="dialog"
								aria-label={ translate( 'Start date picker' ) }
							>
								<DatePicker
									currentDate={ startDate }
									onChange={ ( date ) => {
										dispatch( recordTracksEvent( 'calypso_a4a_reports_custom_start_date_select' ) );
										setStartDate( date );
										// If end date is set and is before or equal to the new start date,
										// set end date to the day after start date
										if ( endDate && new Date( date ) >= new Date( endDate ) ) {
											const nextDay = new Date( date );
											nextDay.setDate( nextDay.getDate() + 1 );
											setEndDate( nextDay.toISOString().split( 'T' )[ 0 ] );
										}
										setIsStartDatePickerOpen( false );
									} }
									isInvalidDate={ ( date ) => {
										// Disable dates from today onwards (only yesterday and earlier allowed)
										const today = new Date();
										today.setHours( 0, 0, 0, 0 ); // Start of today
										return new Date( date ) >= today;
									} }
								/>
							</Popover>
						) }
					</div>
					<div className="build-report__date-field">
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							id="end-date"
							label={ translate( 'End date' ) }
							value={ formatDate( endDate ) }
							placeholder={ translate( 'Select end date' ) }
							onChange={ () => {} }
							onClick={ () => setIsEndDatePickerOpen( true ) }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' || event.key === ' ' ) {
									event.preventDefault();
									setIsEndDatePickerOpen( true );
								}
							} }
							readOnly
							className="build-report__date-input"
							role="button"
							aria-expanded={ isEndDatePickerOpen }
							aria-haspopup="dialog"
						/>
						{ isEndDatePickerOpen && (
							<Popover
								onClose={ () => setIsEndDatePickerOpen( false ) }
								placement="bottom-start"
								className="build-report__date-popover"
								onFocusOutside={ () => setIsEndDatePickerOpen( false ) }
								role="dialog"
								aria-label={ translate( 'End date picker' ) }
							>
								<DatePicker
									currentDate={ endDate }
									onChange={ ( date ) => {
										dispatch( recordTracksEvent( 'calypso_a4a_reports_custom_end_date_select' ) );
										setEndDate( date );
										setIsEndDatePickerOpen( false );
									} }
									isInvalidDate={ ( date ) => {
										// Disable dates after today (only today and earlier allowed)
										const today = new Date();
										today.setHours( 23, 59, 59, 999 ); // End of today
										if ( new Date( date ) > today ) {
											return true;
										}

										// Disable dates before the start date
										if ( ! startDate ) {
											return false;
										}
										return new Date( date ) < new Date( startDate );
									} }
								/>
							</Popover>
						) }
					</div>
				</div>
			) }
			<div className="build-report__field">
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'Client email(s)' ) }
					value={ clientEmail }
					onChange={ setClientEmail }
					type="text"
					help={
						! hasFieldError( 'clientEmail' )
							? translate( "We'll email the report here. Use commas to separate addresses." )
							: undefined
					}
					data-field="clientEmail"
					disabled={ isLoadingState }
					aria-required="true"
					aria-describedby="client-email-error"
					aria-invalid={ hasFieldError( 'clientEmail' ) }
				/>
				{ hasFieldError( 'clientEmail' ) && (
					<div
						role="alert"
						id="client-email-error"
						aria-live="polite"
						className="build-report__error-message"
					>
						{ getFieldError( 'clientEmail' ) }
					</div>
				) }
			</div>
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ translate( 'Also send to your team' ) }
				checked={ sendCopyToTeam }
				onChange={ ( checked ) => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_reports_send_to_team_toggle', { enabled: checked } )
					);
					setSendCopyToTeam( checked );
				} }
				disabled={ isLoadingState }
			/>
			{ sendCopyToTeam && (
				<div>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ translate( 'Teammate email(s)' ) }
						value={ teammateEmails }
						onChange={ setTeammateEmails }
						type="text"
						help={
							! hasFieldError( 'teammateEmails' )
								? translate( 'Use commas to separate addresses.' )
								: undefined
						}
						placeholder={ translate( 'colleague1@example.com, colleague2@example.com' ) }
						data-field="teammateEmails"
						disabled={ isLoadingState }
						aria-required="true"
						aria-describedby="teammate-emails-error"
						aria-invalid={ hasFieldError( 'teammateEmails' ) }
					/>
					{ hasFieldError( 'teammateEmails' ) && (
						<div
							role="alert"
							id="teammate-emails-error"
							aria-live="polite"
							className="build-report__error-message"
						>
							{ getFieldError( 'teammateEmails' ) }
						</div>
					) }
				</div>
			) }
		</>
	);
}

import {
	CheckboxControl,
	DatePicker,
	Popover,
	SelectControl,
	Spinner,
	TextareaControl,
	TextControl,
	Button,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import A4ASelectSite from 'calypso/a8c-for-agencies/components/a4a-select-site';
import { formatDate } from '../../lib/format-date';
import { getStatsOptions } from '../../lib/stat-options';
import { getAvailableTimeframes } from '../../lib/timeframes';
import type {
	BuildReportFormData,
	BuildReportState,
	UseDuplicateReportFormDataHandlers,
} from '../../types';
import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

interface BuildReportContentProps {
	currentStep: number;
	formData: BuildReportFormData;
	state: BuildReportState;
	handlers: UseDuplicateReportFormDataHandlers;
}

export default function BuildReportContent( {
	currentStep,
	formData,
	state,
	handlers,
}: BuildReportContentProps ) {
	const translate = useTranslate();

	// Internal state for date pickers
	const [ isStartDatePickerOpen, setIsStartDatePickerOpen ] = useState( false );
	const [ isEndDatePickerOpen, setIsEndDatePickerOpen ] = useState( false );

	const [ isSendPreview, setIsSendPreview ] = useState( false );

	const {
		selectedSite,
		selectedTimeframe,
		startDate,
		endDate,
		clientEmail,
		sendCopyToTeam,
		teammateEmails,
		customIntroText,
		statsCheckedItems,
	} = formData;

	const {
		isDuplicateLoading,
		sendReportMutation,
		sendReportEmailMutation,
		reportId,
		isReportPending,
		isReportErrorStatus,
		isProcessed,
		showValidationErrors,
		validationErrors,
	} = state;

	const {
		setSelectedSite,
		setSelectedTimeframe,
		setStartDate,
		setEndDate,
		setClientEmail,
		setSendCopyToTeam,
		setTeammateEmails,
		setCustomIntroText,
		setStatsCheckedItems,
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

	const handleStep2CheckboxChange = useCallback(
		( itemName: string ) => {
			setStatsCheckedItems( {
				...statsCheckedItems,
				[ itemName ]: ! statsCheckedItems[ itemName ],
			} );
		},
		[ statsCheckedItems, setStatsCheckedItems ]
	);

	const isCreatingReport = sendReportMutation.isPending;
	const isSendingPreview = isSendPreview && sendReportEmailMutation.isPending;
	const isLoadingState = isDuplicateLoading || isCreatingReport;

	const handleSendPreview = useCallback( () => {
		if ( reportId ) {
			setIsSendPreview( true );
			sendReportEmailMutation.mutate(
				{ reportId, preview: true },
				{
					onSettled: () => setIsSendPreview( false ),
				}
			);
		}
	}, [ reportId, sendReportEmailMutation ] );

	const availableTimeframes = getAvailableTimeframes( translate );
	const statsOptions = getStatsOptions( translate );

	switch ( currentStep ) {
		case 1:
			return (
				<>
					<h2 className="build-report__step-title">
						{ translate( 'Step 1 of 3: Enter report details' ) }
					</h2>

					<div className="build-report__field">
						<A4ASelectSite
							isDisabled={ isLoadingState }
							selectedSiteId={ selectedSite?.blogId }
							onSiteSelect={ ( site: A4ASelectSiteItem ) => setSelectedSite( site ) }
							buttonLabel={ selectedSite?.domain || translate( 'Choose a site to report on' ) }
							trackingEvent="calypso_a4a_reports_select_site_button_click"
							data-field="selectedSite"
						/>
						{ hasFieldError( 'selectedSite' ) && (
							<div className="build-report__error-message">{ getFieldError( 'selectedSite' ) }</div>
						) }
					</div>

					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ translate( 'Report date range' ) }
						value={ selectedTimeframe }
						options={ availableTimeframes }
						onChange={ setSelectedTimeframe }
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
									value={ formatDate( startDate ) }
									placeholder={ translate( 'Select start date' ) }
									onChange={ () => {} }
									onClick={ () => setIsStartDatePickerOpen( true ) }
									readOnly
									className="build-report__date-input"
								/>
								{ isStartDatePickerOpen && (
									<Popover
										onClose={ () => setIsStartDatePickerOpen( false ) }
										placement="bottom-start"
										className="build-report__date-popover"
									>
										<DatePicker
											currentDate={ startDate }
											onChange={ ( date ) => {
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
									readOnly
									className="build-report__date-input"
								/>
								{ isEndDatePickerOpen && (
									<Popover
										onClose={ () => setIsEndDatePickerOpen( false ) }
										placement="bottom-start"
										className="build-report__date-popover"
									>
										<DatePicker
											currentDate={ endDate }
											onChange={ ( date ) => {
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
						/>
						{ hasFieldError( 'clientEmail' ) && (
							<div className="build-report__error-message">{ getFieldError( 'clientEmail' ) }</div>
						) }
					</div>
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ translate( 'Also send to your team' ) }
						checked={ sendCopyToTeam }
						onChange={ setSendCopyToTeam }
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
							/>
							{ hasFieldError( 'teammateEmails' ) && (
								<div className="build-report__error-message">
									{ getFieldError( 'teammateEmails' ) }
								</div>
							) }
						</div>
					) }
				</>
			);
		case 2:
			return (
				<>
					<h2 className="build-report__step-title">
						{ translate( 'Step 2 of 3: Choose report content' ) }
					</h2>

					<TextareaControl
						__nextHasNoMarginBottom
						label={ translate( 'Intro message (optional)' ) }
						value={ customIntroText }
						onChange={ setCustomIntroText }
						rows={ 3 }
						help={ translate( 'Add a short note or update for your client.' ) }
						disabled={ isLoadingState }
					/>

					<h3 className="build-report__group-label">{ translate( 'Stats' ) }</h3>
					{ statsOptions.map( ( item ) => (
						<CheckboxControl
							__nextHasNoMarginBottom
							key={ item.value }
							label={ item.label }
							checked={ statsCheckedItems[ item.value ] }
							onChange={ () => handleStep2CheckboxChange( item.value ) }
							disabled={ isLoadingState }
						/>
					) ) }
					{ hasFieldError( 'statsCheckedItems' ) && (
						<div className="build-report__error-message">
							{ getFieldError( 'statsCheckedItems' ) }
						</div>
					) }
					<p className="build-report__step-note">
						{ translate( 'Preview, confirm, and send to your client in the next step.' ) }
					</p>
				</>
			);
		case 3:
			if ( reportId ) {
				if ( isReportPending ) {
					return (
						<>
							<h2 className="build-report__step-title">
								{ translate( 'Step 3 of 3: Preparing your report' ) }
							</h2>
							<p className="build-report__loading-state build-report__content-description">
								<Spinner /> { translate( 'Please wait while we prepare your report…' ) }
							</p>
						</>
					);
				}

				if ( isReportErrorStatus ) {
					return (
						<>
							<h2 className="build-report__step-title">
								{ translate( 'Step 3 of 3: Report preparation failed' ) }
							</h2>
							<p className="build-report__step-description">
								{ translate( 'There was an error preparing your report.' ) }
							</p>
						</>
					);
				}

				if ( isProcessed ) {
					return (
						<>
							<h2 className="build-report__step-title">
								{ translate( 'Step 3 of 3: Send your report' ) }
							</h2>

							<p className="build-report__step-description">
								{ translate(
									'Your report is ready for sending. Checkout the preview, then click "Send to client now".'
								) }
								<br />
								{ translate( "We'll take it from there!" ) }
							</p>
							<Button
								variant="secondary"
								onClick={ handleSendPreview }
								className="build-report__preview-button"
								isBusy={ isSendingPreview }
								disabled={ isSendingPreview }
							>
								{ isSendingPreview
									? translate( 'Sending preview…' )
									: translate( 'Send me a preview' ) }
							</Button>
						</>
					);
				}
			}
			return (
				<>
					<h2 className="build-report__step-title">
						{ translate( 'Step 3 of 3: Unknown report status' ) }
					</h2>

					<p className="build-report__step-description">
						{ translate( 'There was an error preparing your report.' ) }
					</p>
				</>
			);

		default:
			return null;
	}
}

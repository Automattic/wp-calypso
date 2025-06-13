import {
	Button,
	SelectControl,
	TextareaControl,
	CheckboxControl,
	TextControl,
	DatePicker,
	Popover,
} from '@wordpress/components';
import { Icon, error } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useMemo, useCallback } from 'react';
import A4ASelectSite from 'calypso/a8c-for-agencies/components/a4a-select-site';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { A4A_REPORTS_LINK } from '../../constants';
import { useFormValidation } from '../../hooks/use-build-report-form-validation';
import { useDuplicateReportFormData } from '../../hooks/use-duplicate-report-form-data';
import { formatDate } from '../../lib/format-date';
import type { BuildReportCheckedItemsState } from '../../types';
import type { A4ASelectSiteItem } from 'calypso/a8c-for-agencies/components/a4a-select-site/types';

import './style.scss';

const BuildReport = () => {
	const translate = useTranslate();

	const availableTimeframes = useMemo(
		() => [
			{ label: translate( 'Last 30 days' ), value: '30_days' },
			{ label: translate( 'Last 7 days' ), value: '7_days' },
			{ label: translate( 'Last 24 hours' ), value: '24_hours' },
			{ label: translate( 'Custom range' ), value: 'custom' },
		],
		[ translate ]
	);

	// Checkbox groups for Step 2
	const statsOptions = useMemo(
		() => [
			{ label: translate( 'Visitors and Views in this timeframe' ), value: 'total_traffic' },
			{ label: translate( 'Top 5 posts' ), value: 'top_pages' },
			{ label: translate( 'Top 5 referrers' ), value: 'top_devices' },
			{ label: translate( 'Top 5 cities' ), value: 'top_locations' },
			{ label: translate( 'Device breakdown' ), value: 'device_breakdown' },
			{
				label: translate( 'Total Visitors and Views since the site was created' ),
				value: 'total_traffic_all_time',
			},
			{ label: translate( 'Most popular time of day' ), value: 'most_popular_time_of_day' },
			{ label: translate( 'Most popular day of week' ), value: 'most_popular_day_of_week' },
		],
		[ translate ]
	);

	// Use the custom hook for form data management
	const {
		formData,
		setSelectedTimeframe,
		setSelectedSite,
		setClientEmail,
		setCustomIntroText,
		setSendMeACopy,
		setTeammateEmails,
		setStartDate,
		setEndDate,
		setStatsCheckedItems,
		isLoading: isDuplicateLoading,
		isDuplicating,
		error: duplicateError,
	} = useDuplicateReportFormData( availableTimeframes, statsOptions );

	const {
		selectedSite,
		selectedTimeframe,
		startDate,
		endDate,
		clientEmail,
		sendMeACopy,
		teammateEmails,
		customIntroText,
		statsCheckedItems,
	} = formData;

	const title = isDuplicating ? translate( 'Duplicate Report' ) : translate( 'Build Report' );

	const [ isStartDatePickerOpen, setIsStartDatePickerOpen ] = useState( false );
	const [ isEndDatePickerOpen, setIsEndDatePickerOpen ] = useState( false );
	const [ showValidationErrors, setShowValidationErrors ] = useState( false );

	const [ currentStep, setCurrentStep ] = useState( 1 );

	// Get validation errors for current step
	const validationErrors = useFormValidation( currentStep, formData );
	const hasErrors = validationErrors.length > 0;

	// Helper to get error message for a specific field
	const getFieldError = useCallback(
		( fieldName: string ): string | undefined => {
			if ( ! showValidationErrors ) {
				return undefined;
			}
			return validationErrors.find( ( error ) => error.field === fieldName )?.message;
		},
		[ showValidationErrors, validationErrors ]
	);

	// Helper to check if field has error
	const hasFieldError = useCallback(
		( fieldName: string ): boolean => {
			return (
				showValidationErrors && validationErrors.some( ( error ) => error.field === fieldName )
			);
		},
		[ showValidationErrors, validationErrors ]
	);

	const handleNextStep = useCallback( () => {
		setShowValidationErrors( true );

		if ( hasErrors ) {
			// Focus on first error field for accessibility
			const firstError = validationErrors[ 0 ];
			const errorElement = document.querySelector( `[data-field="${ firstError.field }"]` );
			if ( errorElement ) {
				( errorElement as HTMLElement ).focus();
			}
			return;
		}

		setShowValidationErrors( false );
		setCurrentStep( ( prev ) => prev + 1 );
	}, [ hasErrors, validationErrors ] );

	const handlePrevStep = useCallback( () => {
		setShowValidationErrors( false );
		setCurrentStep( ( prev ) => prev - 1 );
	}, [] );

	const handleStep2CheckboxChange = useCallback(
		( groupKey: 'stats', itemName: string ) => {
			const setterMap: Record< string, ( value: BuildReportCheckedItemsState ) => void > = {
				stats: ( value: BuildReportCheckedItemsState ) => setStatsCheckedItems( value ),
			};
			setterMap[ groupKey ]?.( {
				...statsCheckedItems,
				[ itemName ]: ! statsCheckedItems[ itemName ],
			} );
		},
		[ statsCheckedItems, setStatsCheckedItems ]
	);

	const stepContent = useMemo( () => {
		switch ( currentStep ) {
			case 1:
				return (
					<>
						<h2 className="build-report__step-title">
							{ translate( 'Step 1 of 3: Enter report details' ) }
						</h2>

						<div className="build-report__field">
							<A4ASelectSite
								isDisabled={ isDuplicateLoading }
								selectedSiteId={ selectedSite?.blogId }
								onSiteSelect={ ( site: A4ASelectSiteItem ) => setSelectedSite( site ) }
								buttonLabel={ selectedSite?.domain || translate( 'Choose a site to report on' ) }
								trackingEvent="calypso_a4a_reports_select_site_button_click"
								data-field="selectedSite"
							/>
							{ hasFieldError( 'selectedSite' ) && (
								<div className="build-report__error-message">
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
							onChange={ setSelectedTimeframe }
							disabled={ isDuplicateLoading }
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
								disabled={ isDuplicateLoading }
							/>
							{ hasFieldError( 'clientEmail' ) && (
								<div className="build-report__error-message">
									{ getFieldError( 'clientEmail' ) }
								</div>
							) }
						</div>
						<CheckboxControl
							__nextHasNoMarginBottom
							label={ translate( 'Also send to your team' ) }
							checked={ sendMeACopy }
							onChange={ setSendMeACopy }
							disabled={ isDuplicateLoading }
						/>
						{ sendMeACopy && (
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
									disabled={ isDuplicateLoading }
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
						/>

						<h3 className="build-report__group-label">{ translate( 'Stats' ) }</h3>
						{ statsOptions.map( ( item ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ item.value }
								label={ item.label }
								checked={ statsCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'stats', item.value ) }
							/>
						) ) }
						{ hasFieldError( 'statsCheckedItems' ) && (
							<div className="build-report__error-message">
								{ getFieldError( 'statsCheckedItems' ) }
							</div>
						) }
					</>
				);
			case 3:
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
							onClick={ () => alert( 'Send test report clicked' ) }
							className="build-report__preview-button"
						>
							{ translate( 'Send me a preview' ) }
						</Button>
					</>
				);
			default:
				return null;
		}
	}, [
		currentStep,
		translate,
		isDuplicateLoading,
		selectedSite?.blogId,
		selectedSite?.domain,
		hasFieldError,
		getFieldError,
		selectedTimeframe,
		availableTimeframes,
		setSelectedTimeframe,
		startDate,
		isStartDatePickerOpen,
		endDate,
		isEndDatePickerOpen,
		clientEmail,
		setClientEmail,
		sendMeACopy,
		setSendMeACopy,
		teammateEmails,
		setTeammateEmails,
		customIntroText,
		setCustomIntroText,
		statsOptions,
		setSelectedSite,
		setStartDate,
		setEndDate,
		statsCheckedItems,
		handleStep2CheckboxChange,
	] );

	const actions = useMemo(
		() => (
			<div className="build-report__actions">
				{ currentStep > 1 && (
					<Button variant="secondary" onClick={ handlePrevStep }>
						{ translate( 'Back' ) }
					</Button>
				) }
				{ currentStep < 3 && (
					<Button variant="primary" onClick={ handleNextStep } disabled={ isDuplicateLoading }>
						{ translate( 'Next' ) }
					</Button>
				) }
				{ currentStep === 3 && (
					<Button variant="primary" onClick={ () => alert( 'Schedule and Send clicked' ) }>
						{ translate( 'Send to client now' ) }
					</Button>
				) }
			</div>
		),
		[ currentStep, handlePrevStep, translate, handleNextStep, isDuplicateLoading ]
	);

	return (
		<Layout className="build-report" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Client Reports' ),
								href: A4A_REPORTS_LINK,
							},
							{
								label: title,
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="build-report__content">
					<div className="build-report__content-header">
						<h1 className="build-report__content-title">{ title }</h1>
						<p className="build-report__content-description">
							{ isDuplicating
								? translate(
										'Start with your previous send. All fields are filled in. Just make updates for the new report and send.'
								  )
								: translate(
										'Get started by choosing the details to include for your client below.'
								  ) }
						</p>
						{ duplicateError && (
							<div className="build-report__content-note">
								<Icon icon={ error } />
								{ translate( 'Note: Some data could not be duplicated.' ) }
							</div>
						) }
					</div>
					<div className="build-report__form">
						{ stepContent }
						{ actions }
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
};

export default BuildReport;

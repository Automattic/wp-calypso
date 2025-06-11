import {
	Button,
	SelectControl,
	TextareaControl,
	CheckboxControl,
	TextControl,
	DatePicker,
	Popover,
} from '@wordpress/components';
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
import { formatDate } from '../../lib/format-date';

import './style.scss';

type CheckedItemsState = Record< string, boolean >;

const BuildReport = () => {
	const translate = useTranslate();
	const title = translate( 'Build Report' );

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

	const today = new Date();
	const yesterday = new Date( today );
	yesterday.setDate( today.getDate() - 1 );

	const [ selectedTimeframe, setSelectedTimeframe ] = useState( availableTimeframes[ 0 ].value );
	const [ selectedSite, setSelectedSite ] = useState( '' );
	const [ clientEmail, setClientEmail ] = useState( '' );
	const [ customIntroText, setCustomIntroText ] = useState( '' );
	const [ sendMeACopy, setSendMeACopy ] = useState( false );
	const [ teammateEmails, setTeammateEmails ] = useState( '' );
	const [ startDate, setStartDate ] = useState< string | undefined >(
		yesterday.toISOString().split( 'T' )[ 0 ]
	);
	const [ endDate, setEndDate ] = useState< string | undefined >(
		today.toISOString().split( 'T' )[ 0 ]
	);
	const [ isStartDatePickerOpen, setIsStartDatePickerOpen ] = useState( false );
	const [ isEndDatePickerOpen, setIsEndDatePickerOpen ] = useState( false );

	const [ statsCheckedItems, setStatsCheckedItems ] = useState< CheckedItemsState >(
		statsOptions.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);

	const [ currentStep, setCurrentStep ] = useState( 1 );

	const handleNextStep = useCallback( () => setCurrentStep( ( prev ) => prev + 1 ), [] );
	const handlePrevStep = useCallback( () => setCurrentStep( ( prev ) => prev - 1 ), [] );

	const handleStep2CheckboxChange = ( groupKey: 'stats', itemName: string ) => {
		const setterMap: Record<
			string,
			React.Dispatch< React.SetStateAction< CheckedItemsState > >
		> = {
			stats: setStatsCheckedItems,
		};
		setterMap[ groupKey ]?.( ( prev: CheckedItemsState ) => ( {
			...prev,
			[ itemName ]: ! prev[ itemName ],
		} ) );
	};

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
								onSiteSelect={ ( _siteId, siteDomain ) => setSelectedSite( siteDomain ) }
								buttonLabel={ selectedSite || translate( 'Choose a site to report on' ) }
								trackingEvent="calypso_a4a_reports_select_site_button_click"
							/>
						</div>

						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ translate( 'Report date range' ) }
							value={ selectedTimeframe }
							options={ availableTimeframes }
							onChange={ setSelectedTimeframe }
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
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ translate( 'Client email(s)' ) }
							value={ clientEmail }
							onChange={ setClientEmail }
							type="email"
							help={ translate( "We'll email the report here. Use commas to separate addresses." ) }
						/>
						<CheckboxControl
							__nextHasNoMarginBottom
							label={ translate( 'Also send to your team' ) }
							checked={ sendMeACopy }
							onChange={ setSendMeACopy }
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
									help={ translate( 'Use commas to separate addresses.' ) }
									placeholder={ translate( 'colleague1@example.com, colleague2@example.com' ) }
								/>
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
		selectedSite,
		selectedTimeframe,
		startDate,
		endDate,
		clientEmail,
		sendMeACopy,
		teammateEmails,
		customIntroText,
		statsCheckedItems,
		isStartDatePickerOpen,
		isEndDatePickerOpen,
		translate,
		availableTimeframes,
		statsOptions,
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
					<Button variant="primary" onClick={ handleNextStep }>
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
		[ currentStep, translate, handleNextStep, handlePrevStep ]
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
								label: translate( 'Build Report' ),
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
					{ stepContent }
					{ actions }
				</div>
			</LayoutBody>
		</Layout>
	);
};

export default BuildReport;

import {
	Button,
	SelectControl,
	TextareaControl,
	CheckboxControl,
	TextControl,
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import SelectSiteButton from 'calypso/a8c-for-agencies/components/select-site-button';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';

import './style.scss';

// Mock data - replace with actual data fetching as needed
const MOCK_TIMEFRAMES = [
	{ label: 'Last 30 days', value: 'last_30_days' },
	{ label: 'Last 7 days', value: 'last_7_days' },
	{ label: 'Last 24 hours', value: 'last_24_hours' },
];

// Checkbox groups for Step 2
const STATS_OPTIONS = [
	{ label: 'Visitors and Views in this timeframe', value: 'total_traffic' },
	{ label: 'Top 5 posts', value: 'top_pages' },
	{ label: 'Top 5 referrers', value: 'top_devices' },
	{ label: 'Top 5 cities', value: 'top_locations' },
	{ label: 'Device breakdown', value: 'top_locations' },
	{ label: 'Total Visitors and Views since the site was created', value: 'total_traffic-all-time' },
	{ label: 'Most popular time of day', value: 'most_popular_time_of_day' },
	{ label: 'Most popular day of week', value: 'most_popular_day_of_week' },
];

type CheckedItemsState = Record< string, boolean >;

const BuildReport = () => {
	const translate = useTranslate();
	const title = translate( 'Build Report' );
	const teammateEmailsRef = useRef< HTMLDivElement >( null );

	// Step 1: Setup State
	const [ selectedTimeframe, setSelectedTimeframe ] = useState( MOCK_TIMEFRAMES[ 0 ].value );
	const [ selectedSite, setSelectedSite ] = useState( '' );
	const [ clientEmail, setClientEmail ] = useState( '' );
	// const [ clientName, setClientName ] = useState( '' );
	const [ customIntroText, setCustomIntroText ] = useState( '' );
	const [ sendMeACopy, setSendMeACopy ] = useState( false );
	const [ teammateEmails, setTeammateEmails ] = useState( '' );

	// Step 2: Pick Content State
	const [ statsCheckedItems, setStatsCheckedItems ] = useState< CheckedItemsState >(
		STATS_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);

	// Step 3: Schedule and Send State
	const [ currentStep, setCurrentStep ] = useState( 1 );
	const handleNextStep = () => setCurrentStep( ( prev ) => prev + 1 );
	const handlePrevStep = () => setCurrentStep( ( prev ) => prev - 1 );

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

	// Auto-scroll to teammate emails field when checkbox is checked
	useEffect( () => {
		if ( sendMeACopy && teammateEmailsRef.current ) {
			setTimeout( () => {
				teammateEmailsRef.current?.scrollIntoView( { behavior: 'smooth', block: 'center' } );
			}, 100 ); // Small delay to ensure field is rendered
		}
	}, [ sendMeACopy ] );

	const renderStepContent = () => {
		switch ( currentStep ) {
			case 1:
				return (
					<>
						<div className="build-report__step-header">
							<h2 className="build-report__step-title">
								{ translate( 'Step 1 of 3: Enter report details' ) }
							</h2>
						</div>

						<div className="build-report__field">
							<SelectSiteButton
								onSiteSelect={ ( _siteId, siteDomain ) => setSelectedSite( siteDomain ) }
								buttonLabel={ selectedSite || translate( 'Choose a site to report on' ) }
								helpText={
									<>
										{ translate(
											"If you don't see the site in the list, connect it first via the "
										) }
										<a href="/sites" target="_blank" rel="noopener noreferrer">
											{ translate( 'Sites Dashboard' ) }
										</a>
										{ translate( '.' ) }
										<br />
										{ translate(
											'Only live WordPress.com sites or Pressable sites with Jetpack installed are supported.'
										) }
									</>
								}
								trackingEvent="calypso_a4a_reports_select_site_button_click"
							/>
						</div>
						<SelectControl
							label={ translate( 'Date range' ) }
							value={ selectedTimeframe }
							options={ MOCK_TIMEFRAMES }
							onChange={ setSelectedTimeframe }
						/>
						<TextControl
							label={ translate( 'Client email(s)' ) }
							value={ clientEmail }
							onChange={ setClientEmail }
							type="email"
							help={ translate( "We'll email the report here. Use commas to separate addresses." ) }
						/>
						<CheckboxControl
							label={ translate( 'Also send to your team' ) }
							checked={ sendMeACopy }
							onChange={ setSendMeACopy }
						/>
						{ sendMeACopy && (
							<div ref={ teammateEmailsRef }>
								<TextControl
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
						<div className="build-report__step-header">
							<h2 className="build-report__step-title">
								{ translate( 'Step 2 of 3: Choose report content' ) }
							</h2>
						</div>

						<TextareaControl
							label={ translate( 'Intro message (optional)' ) }
							value={ customIntroText }
							onChange={ setCustomIntroText }
							rows={ 3 }
							help={ translate( 'Add a short note or update for your client.' ) }
						/>

						<h3 className="build-report__group-label build-report__group-label--first">
							{ translate( 'Stats' ) }
						</h3>
						{ STATS_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ statsCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'stats', item.value ) }
								className="build-report__checkbox-control"
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

						<Button variant="secondary" onClick={ () => alert( 'Send test report clicked' ) }>
							{ translate( 'Send me a preview' ) }
						</Button>
					</>
				);
			default:
				return null;
		}
	};

	const renderActions = () => (
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
					{ renderStepContent() }
					{ renderActions() }
				</div>
			</LayoutBody>
		</Layout>
	);
};

export default BuildReport;

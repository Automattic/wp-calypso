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

const MOCK_SITES = [
	{ label: 'totoros.blog', value: 'totoros.blog' },
	{ label: 'kikisdeliveryservice.com', value: 'kikisdeliveryservice.com' },
	{ label: 'laputa.castle.sky', value: 'laputa.castle.sky' },
];

// Checkbox groups for Step 2
const STATS_OPTIONS = [
	{ label: 'Total traffic in this timeframe', value: 'total_traffic' },
	{ label: 'Top 5 pages', value: 'top_pages' },
	{ label: 'Top devices', value: 'top_devices' },
	{ label: 'Top locations', value: 'top_locations' },
];

const SECURITY_OPTIONS = [ { label: 'Backups made in this timeframe', value: 'backups_made' } ];

const PERFORMANCE_OPTIONS = [ { label: 'Uptime information', value: 'uptime_info' } ];

type CheckedItemsState = Record< string, boolean >;

const BuildReport = () => {
	const translate = useTranslate();
	const title = translate( 'Build Report' );
	const teammateEmailsRef = useRef< HTMLDivElement >( null );

	// Step 1: Setup State
	const [ selectedSite, setSelectedSite ] = useState( MOCK_SITES[ 0 ].value );
	const [ selectedTimeframe, setSelectedTimeframe ] = useState( MOCK_TIMEFRAMES[ 0 ].value );
	const [ clientEmail, setClientEmail ] = useState( '' );
	const [ clientName, setClientName ] = useState( '' );
	const [ customIntroText, setCustomIntroText ] = useState( '' );
	const [ sendMeACopy, setSendMeACopy ] = useState( false );
	const [ teammateEmails, setTeammateEmails ] = useState( '' );

	// Step 2: Pick Content State
	const [ statsCheckedItems, setStatsCheckedItems ] = useState< CheckedItemsState >(
		STATS_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);
	const [ securityCheckedItems, setSecurityCheckedItems ] = useState< CheckedItemsState >(
		SECURITY_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);
	const [ performanceCheckedItems, setPerformanceCheckedItems ] = useState< CheckedItemsState >(
		PERFORMANCE_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: true } ), {} )
	);

	// Step 3: Schedule and Send State
	const [ currentStep, setCurrentStep ] = useState( 1 );
	const handleNextStep = () => setCurrentStep( ( prev ) => prev + 1 );
	const handlePrevStep = () => setCurrentStep( ( prev ) => prev - 1 );

	const handleStep2CheckboxChange = (
		groupKey: 'stats' | 'security' | 'performance',
		itemName: string
	) => {
		const setterMap: Record<
			string,
			React.Dispatch< React.SetStateAction< CheckedItemsState > >
		> = {
			stats: setStatsCheckedItems,
			security: setSecurityCheckedItems,
			performance: setPerformanceCheckedItems,
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
							<h2 className="build-report__step-title">{ translate( 'Step 1 of 3: Setup' ) }</h2>
							<p className="build-report__step-description">
								{ translate(
									'Start by choosing the timeframe and site you want to create a report for.'
								) }
							</p>
						</div>

						<SelectControl
							label={ translate( 'Pick a timeframe:' ) }
							value={ selectedTimeframe }
							options={ MOCK_TIMEFRAMES }
							onChange={ setSelectedTimeframe }
						/>
						<SelectControl
							label={ translate( 'Pick a site:' ) }
							value={ selectedSite }
							options={ MOCK_SITES }
							onChange={ setSelectedSite }
						/>
						<TextControl
							label={ translate( 'Client name (optional)' ) }
							value={ clientName }
							onChange={ setClientName }
						/>
						<TextControl
							label={ translate( 'Client email' ) }
							value={ clientEmail }
							onChange={ setClientEmail }
							type="email"
							help={ translate( 'Enter the email addresses of your client separated by commas' ) }
						/>
						<TextareaControl
							label={ translate( 'Custom intro text (optional)' ) }
							value={ customIntroText }
							onChange={ setCustomIntroText }
							rows={ 3 }
						/>
						<CheckboxControl
							label={ translate( 'Email a copy to agency teammates' ) }
							checked={ sendMeACopy }
							onChange={ setSendMeACopy }
						/>
						{ sendMeACopy && (
							<div ref={ teammateEmailsRef }>
								<TextControl
									label={ translate( 'Teammate emails' ) }
									value={ teammateEmails }
									onChange={ setTeammateEmails }
									type="text"
									help={ translate(
										'Enter the email addresses of your teammates separated by commas'
									) }
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
							<h2 className="build-report__step-title">{ translate( 'Step 2 of 3: Content' ) }</h2>
							<p className="build-report__step-description">
								{ translate( 'Now pick the content you want to include in the report.' ) }
							</p>
						</div>

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
						<h3 className="build-report__group-label">{ translate( 'Security' ) }</h3>
						{ SECURITY_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ securityCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'security', item.value ) }
								className="build-report__checkbox-control"
							/>
						) ) }
						<h3 className="build-report__group-label">{ translate( 'Performance' ) }</h3>
						{ PERFORMANCE_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ performanceCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'performance', item.value ) }
								className="build-report__checkbox-control"
							/>
						) ) }
					</>
				);
			case 3:
				return (
					<>
						<h2 className="build-report__step-title">{ translate( 'Step 3 of 3: Send' ) }</h2>

						<p className="build-report__step-description">
							{ translate( 'The report is ready to be sent to your client. ' ) }
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
					{ translate( 'Prev' ) }
				</Button>
			) }
			{ currentStep < 3 && (
				<Button variant="primary" onClick={ handleNextStep }>
					{ translate( 'Next' ) }
				</Button>
			) }
			{ currentStep === 3 && (
				<Button variant="primary" onClick={ () => alert( 'Schedule and Send clicked' ) }>
					{ translate( 'Send the report now' ) }
				</Button>
			) }
		</div>
	);

	return (
		<Layout
			className="build-report"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
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
					<Actions>
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

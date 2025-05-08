import {
	Button,
	Modal,
	SelectControl,
	TextareaControl,
	CheckboxControl,
	TextControl,
	FormFileUpload,
	DateTimePicker,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';

import './style.scss';

// Mock data - replace with actual data fetching as needed
const MOCK_TIMEFRAMES = [
	{ label: 'Last month', value: 'last_month' },
	{ label: 'Last week', value: 'last_week' },
	{ label: 'Last 24 hours', value: 'last_24_hours' },
];

// Checkbox groups for Step 2
const STATS_OPTIONS = [
	{ label: 'Total traffic this month', value: 'total_traffic' },
	{ label: 'Top 5 pages', value: 'top_pages' },
	{ label: 'Top devices', value: 'top_devices' },
	{ label: 'Top locations', value: 'top_locations' },
];

const SECURITY_OPTIONS = [ { label: 'Backups made', value: 'backups_made' } ];

const PERFORMANCE_OPTIONS = [ { label: 'Uptime information', value: 'uptime_info' } ];

type CheckedItemsState = Record< string, boolean >;

export default function ReportsComponent() {
	const translate = useTranslate();
	const pageTitle = translate( 'Reports' );
	const [ isModalOpen, setModalOpen ] = useState( false );
	const [ currentStep, setCurrentStep ] = useState( 1 );

	// Step 1: Setup State
	const [ logoFile, setLogoFile ] = useState< File | null >( null );
	const [ selectedTimeframe, setSelectedTimeframe ] = useState( MOCK_TIMEFRAMES[ 0 ].value );
	const [ clientEmail, setClientEmail ] = useState( '' );
	const [ clientName, setClientName ] = useState( '' );
	const [ customIntroText, setCustomIntroText ] = useState( '' );
	const [ sendMeACopy, setSendMeACopy ] = useState( false );

	// Step 2: Pick Content State
	const [ statsCheckedItems, setStatsCheckedItems ] = useState< CheckedItemsState >(
		STATS_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: false } ), {} )
	);
	const [ securityCheckedItems, setSecurityCheckedItems ] = useState< CheckedItemsState >(
		SECURITY_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: false } ), {} )
	);
	const [ performanceCheckedItems, setPerformanceCheckedItems ] = useState< CheckedItemsState >(
		PERFORMANCE_OPTIONS.reduce( ( acc, item ) => ( { ...acc, [ item.value ]: false } ), {} )
	);

	// Step 3: Schedule and Send State
	const [ scheduleDate, setScheduleDate ] = useState( new Date() );

	const openModal = () => {
		setCurrentStep( 1 );
		setModalOpen( true );
	};
	const closeModal = () => setModalOpen( false );

	const handleNextStep = () => setCurrentStep( ( prev ) => prev + 1 );
	const handlePrevStep = () => setCurrentStep( ( prev ) => prev - 1 );

	const handleFileUpload = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		if ( event.target.files && event.target.files.length > 0 ) {
			setLogoFile( event.target.files[ 0 ] );
		}
	};

	const handleStep2CheckboxChange = (
		groupKey: 'stats' | 'security' | 'performance',
		itemName: string
	) => {
		const setterMap: Record< string, Dispatch< SetStateAction< CheckedItemsState > > > = {
			stats: setStatsCheckedItems,
			security: setSecurityCheckedItems,
			performance: setPerformanceCheckedItems,
		};
		setterMap[ groupKey ]?.( ( prev: CheckedItemsState ) => ( {
			...prev,
			[ itemName ]: ! prev[ itemName ],
		} ) );
	};

	const handlePreviewLinkClick = () => {
		window.open( '#', '_blank' ); // Placeholder action
	};

	const handlePreviewLinkKeyDown = ( event: React.KeyboardEvent< HTMLSpanElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			handlePreviewLinkClick();
		}
	};

	const handleDateChange = ( newDate: string | null ) => {
		if ( newDate ) {
			setScheduleDate( new Date( newDate ) );
		}
	};

	const renderStepContent = () => {
		switch ( currentStep ) {
			case 1:
				return (
					<>
						<h2 className="a4a-reports-modal__step-title">{ translate( 'Step 1: Setup' ) }</h2>
						<FormFileUpload
							accept="image/*"
							onChange={ handleFileUpload }
							render={ ( { openFileDialog } ) => (
								<Button onClick={ openFileDialog } variant="secondary">
									{ logoFile ? logoFile.name : translate( 'Add your logo (optional)' ) }
								</Button>
							) }
							className="a4a-reports-modal__file-upload"
						/>
						<SelectControl
							label={ translate( 'Pick a timeframe:' ) }
							value={ selectedTimeframe }
							options={ MOCK_TIMEFRAMES }
							onChange={ setSelectedTimeframe }
							className="a4a-reports-modal__form-field"
						/>
						<TextControl
							label={ translate( 'Client email' ) }
							value={ clientEmail }
							onChange={ setClientEmail }
							type="email"
							className="a4a-reports-modal__form-field"
						/>
						<TextControl
							label={ translate( 'Client name (optional)' ) }
							value={ clientName }
							onChange={ setClientName }
							className="a4a-reports-modal__form-field"
						/>
						<TextareaControl
							label={ translate( 'Custom intro text (optional)' ) }
							value={ customIntroText }
							onChange={ setCustomIntroText }
							rows={ 4 }
							className="a4a-reports-modal__form-field"
						/>
						<CheckboxControl
							label={ translate( 'Send me a copy' ) }
							checked={ sendMeACopy }
							onChange={ setSendMeACopy }
							className="a4a-reports-modal__form-field"
						/>
					</>
				);
			case 2:
				return (
					<>
						<h2 className="a4a-reports-modal__step-title">
							{ translate( 'Step 2: Pick Content' ) }
						</h2>
						<h3 className="a4a-reports-modal__group-label a4a-reports-modal__group-label--first">
							{ translate( 'Stats' ) }
						</h3>
						{ STATS_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ statsCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'stats', item.value ) }
								className="a4a-reports-modal__checkbox-control"
							/>
						) ) }
						<h3 className="a4a-reports-modal__group-label">{ translate( 'Security' ) }</h3>
						{ SECURITY_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ securityCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'security', item.value ) }
								className="a4a-reports-modal__checkbox-control"
							/>
						) ) }
						<h3 className="a4a-reports-modal__group-label">{ translate( 'Performance' ) }</h3>
						{ PERFORMANCE_OPTIONS.map( ( item ) => (
							<CheckboxControl
								key={ item.value }
								label={ item.label }
								checked={ performanceCheckedItems[ item.value ] }
								onChange={ () => handleStep2CheckboxChange( 'performance', item.value ) }
								className="a4a-reports-modal__checkbox-control"
							/>
						) ) }
					</>
				);
			case 3:
				return (
					<>
						<h2 className="a4a-reports-modal__step-title">
							{ translate( 'Step 3: Schedule & Send' ) }
						</h2>
						<div className="a4a-reports-modal__form-field">
							<label>{ translate( 'When should it send?' ) }</label>
							<DateTimePicker currentDate={ scheduleDate } onChange={ handleDateChange } is12Hour />
						</div>
						<p className="a4a-reports-modal__form-field">
							{ translate( 'Preview external link: ' ) }
							<span
								role="link"
								tabIndex={ 0 }
								onClick={ handlePreviewLinkClick }
								onKeyDown={ handlePreviewLinkKeyDown }
								className="a4a-reports-modal__preview-link"
							>
								{ translate( 'View Preview (link placeholder)' ) }
							</span>
						</p>
						<Button
							variant="secondary"
							onClick={ () => alert( 'Send test report clicked' ) }
							className="a4a-reports-modal__form-field"
						>
							{ translate( 'Send me test report' ) }
						</Button>
					</>
				);
			default:
				return null;
		}
	};

	const renderModalActions = () => (
		<div className="a4a-reports-modal__actions">
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
					{ translate( 'Schedule and Send' ) }
				</Button>
			) }
		</div>
	);

	return (
		<Layout title={ pageTitle } wide>
			<LayoutBody className="a4a-reports-content">
				<div style={ { padding: 32 } }>
					<h1>{ pageTitle }</h1>
					<p>{ translate( 'This is the Reports section. Content coming soon.' ) }</p>
					<Button variant="primary" onClick={ openModal }>
						{ translate( 'Build Report' ) }
					</Button>
				</div>
				{ isModalOpen && (
					<Modal
						size="large"
						title={ translate( 'Build a report for your client' ) }
						onRequestClose={ closeModal }
						className={ `a4a-reports-modal is-wizard-step-${ currentStep }` }
					>
						<div className="a4a-reports-modal__step-content">{ renderStepContent() }</div>
						{ renderModalActions() }
					</Modal>
				) }
			</LayoutBody>
		</Layout>
	);
}

import {
	Button,
	Modal,
	SelectControl,
	TextareaControl,
	CheckboxControl,
	TextControl,
	DateTimePicker,
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction } from 'react';

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
	{ label: 'Total traffic this month', value: 'total_traffic' },
	{ label: 'Top 5 pages', value: 'top_pages' },
	{ label: 'Top devices', value: 'top_devices' },
	{ label: 'Top locations', value: 'top_locations' },
];

const SECURITY_OPTIONS = [ { label: 'Backups made', value: 'backups_made' } ];

const PERFORMANCE_OPTIONS = [ { label: 'Uptime information', value: 'uptime_info' } ];

type CheckedItemsState = Record< string, boolean >;

type BuildReportModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export default function BuildReportModal( { isOpen, onClose }: BuildReportModalProps ) {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 1 );
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
	const [ sendMonthly, setSendMonthly ] = useState( false );

	const handleNextStep = () => setCurrentStep( ( prev ) => prev + 1 );
	const handlePrevStep = () => setCurrentStep( ( prev ) => prev - 1 );

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
						<h2 className="a4a-reports-modal__step-title">
							{ translate( 'Step 1 of 3: Set up' ) }
						</h2>

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
						<h2 className="a4a-reports-modal__step-title">
							{ translate( 'Step 2 of 3: Pick Content' ) }
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
						<h2 className="a4a-reports-modal__step-title">{ translate( 'Step 3 of 3: Send' ) }</h2>
						<div>
							<label>{ translate( 'When should it send?' ) }</label>
							<DateTimePicker currentDate={ scheduleDate } onChange={ handleDateChange } is12Hour />
						</div>
						<CheckboxControl
							label={ translate( 'Send monthly?' ) }
							checked={ sendMonthly }
							onChange={ setSendMonthly }
						/>
						{ sendMonthly && (
							<p className="a4a-reports-modal__form-field a4a-reports-modal__conditional-text">
								{ translate(
									'Your custom text from step one, will be included in each sent report'
								) }
							</p>
						) }
						<p>
							{ translate( 'Preview external link: ' ) }
							<span
								role="link"
								tabIndex={ 0 }
								onClick={ handlePreviewLinkClick }
								onKeyDown={ handlePreviewLinkKeyDown }
								className="a4a-reports-modal__preview-link"
							>
								{ translate( 'View Preview' ) }
							</span>
						</p>
						<Button variant="secondary" onClick={ () => alert( 'Send test report clicked' ) }>
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

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			size="medium"
			title={ translate( 'Build a report for your client' ) }
			onRequestClose={ onClose }
			className={ `a4a-reports-modal is-wizard-step-${ currentStep }` }
		>
			<div className="a4a-reports-modal__step-content">{ renderStepContent() }</div>
			{ renderModalActions() }
		</Modal>
	);
}

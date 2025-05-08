import {
	Button,
	Modal,
	SelectControl,
	ToggleControl,
	TextareaControl,
	CheckboxControl,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';

import './style.scss';

// Mock data for dropdowns - replace with actual data fetching as needed
const MOCK_SITES = [
	{ label: 'totoros.blog', value: 'totoros.blog' },
	{ label: 'another.site', value: 'another.site' },
];

const MOCK_TIMEFRAMES = [
	{ label: 'Last month', value: 'last_month' },
	{ label: 'Last week', value: 'last_week' },
	{ label: 'Last 24 hours', value: 'last_24_hours' },
];

const REPORT_ITEMS = [
	{ label: 'Stats', value: 'stats' },
	{ label: 'Protect status', value: 'protect_status' },
	{ label: 'Top performing pages', value: 'top_pages' },
	{ label: 'VaultPress Backup status', value: 'backup_status' },
	{ label: 'Activity log', value: 'activity_log' },
	{ label: 'Downtime Monitoring status', value: 'monitoring_status' },
	{ label: 'Jetpack Scan status', value: 'scan_status' },
	{ label: 'Akismet Anti-spam status', value: 'akismet_status' },
	{ label: 'Jetpack and WordPress status', value: 'jetpack_wp_status' },
];

export default function ReportsComponent() {
	const translate = useTranslate();
	const title = translate( 'Reports' );
	const [ isModalOpen, setModalOpen ] = useState( false );

	// Form state
	const [ selectedSite, setSelectedSite ] = useState( MOCK_SITES[ 0 ].value );
	const [ selectedTimeframe, setSelectedTimeframe ] = useState( MOCK_TIMEFRAMES[ 0 ].value );
	const [ includeCustomText, setIncludeCustomText ] = useState( true );
	const [ customText, setCustomText ] = useState(
		"In line with our commitment to maintaining the highest security standards for your website, we've conducted a thorough review and update of your site's security measures."
	);
	const [ includedReportItems, setIncludedReportItems ] = useState(
		REPORT_ITEMS.reduce(
			( acc, item ) => {
				acc[ item.value ] = true;
				return acc;
			},
			{} as Record< string, boolean >
		)
	);

	const openModal = () => setModalOpen( true );
	const closeModal = () => setModalOpen( false );

	const handleReportItemChange = ( itemName: string ) => {
		setIncludedReportItems( ( prev ) => ( {
			...prev,
			[ itemName ]: ! prev[ itemName ],
		} ) );
	};

	const handleCreateReport = () => {
		// Logic to create report will go here
		closeModal();
	};

	// Split report items for two-column layout
	const halfwayPoint = Math.ceil( REPORT_ITEMS.length / 2 );
	const reportItemsCol1 = REPORT_ITEMS.slice( 0, halfwayPoint );
	const reportItemsCol2 = REPORT_ITEMS.slice( halfwayPoint );

	return (
		<Layout title={ title } wide>
			<LayoutBody className="a4a-reports-content">
				<div style={ { padding: 32 } }>
					<h1>{ title }</h1>
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
						className="a4a-reports-modal"
					>
						<SelectControl
							label={ translate( 'Pick a site:' ) }
							value={ selectedSite }
							options={ MOCK_SITES }
							onChange={ setSelectedSite }
							className="a4a-reports-modal__select-control"
						/>
						<SelectControl
							label={ translate( 'Pick a timeframe:' ) }
							value={ selectedTimeframe }
							options={ MOCK_TIMEFRAMES }
							onChange={ setSelectedTimeframe }
							className="a4a-reports-modal__select-control"
						/>
						<ToggleControl
							label={ translate( 'Include custom text' ) }
							checked={ includeCustomText }
							onChange={ setIncludeCustomText }
							className="a4a-reports-modal__toggle-control"
						/>
						{ includeCustomText && (
							<TextareaControl
								value={ customText }
								onChange={ setCustomText }
								rows={ 4 }
								className="a4a-reports-modal__textarea-control"
							/>
						) }
						<p className="a4a-reports-modal__section-label">
							{ translate( 'Decide what to include into the report:' ) }
						</p>
						<Flex className="a4a-reports-modal__checkbox-group" justify="space-between">
							<FlexItem>
								{ reportItemsCol1.map( ( item ) => (
									<CheckboxControl
										key={ item.value }
										label={ item.label }
										checked={ includedReportItems[ item.value ] }
										onChange={ () => handleReportItemChange( item.value ) }
										className="a4a-reports-modal__checkbox-control"
									/>
								) ) }
							</FlexItem>
							<FlexItem>
								{ reportItemsCol2.map( ( item ) => (
									<CheckboxControl
										key={ item.value }
										label={ item.label }
										checked={ includedReportItems[ item.value ] }
										onChange={ () => handleReportItemChange( item.value ) }
										className="a4a-reports-modal__checkbox-control"
									/>
								) ) }
							</FlexItem>
						</Flex>
						<div className="a4a-reports-modal__actions">
							<Button variant="secondary" onClick={ closeModal }>
								{ translate( 'Cancel' ) }
							</Button>
							<Button variant="primary" onClick={ handleCreateReport }>
								{ translate( 'Create report' ) }
							</Button>
						</div>
					</Modal>
				) }
			</LayoutBody>
		</Layout>
	);
}

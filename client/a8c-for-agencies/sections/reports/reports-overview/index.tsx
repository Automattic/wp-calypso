import page from '@automattic/calypso-router';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REPORTS_BUILD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import ExampleReport from 'calypso/a8c-for-agencies/sections/reports/example-report';
import whyImage from 'calypso/assets/images/a8c-for-agencies/reports/report-mock-2.png';
import readyImage from 'calypso/assets/images/a8c-for-agencies/reports/report-mock-3.png';
import heroImage from 'calypso/assets/images/a8c-for-agencies/reports/report-mock.png';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const ReportsOverview = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isExampleReportModalOpen, setIsExampleReportModalOpen ] = useState( false );

	const title = translate( 'Client Reports' );

	const listItems1 = useMemo(
		() => [
			translate(
				"Automated professional client reports that highlight key metrics from your clients' sites."
			),
			translate(
				'Show clients the value of your ongoing work with beautiful, professional reports.'
			),
			translate(
				'Include detailed statistics, security measures, and performance indicators that matter most.'
			),
			translate(
				'Coming soon: Schedule regular report delivery to keep clients informed without extra work.'
			),
		],
		[ translate ]
	);

	const listItems2 = useMemo(
		() => [
			translate(
				'Choose exactly what data to include in each report based on client needs and priorities.'
			),
			translate(
				'Demonstrate the ongoing value of your services with clear, easy-to-understand metrics.'
			),
			translate( 'Strengthen client relationships with regular, professional communication.' ),
		],
		[ translate ]
	);

	const handleBuildReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_build_report_button_click' ) );
		page( A4A_REPORTS_BUILD_LINK );
	}, [ dispatch ] );

	const handleExampleReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_example_report_button_click' ) );
		setIsExampleReportModalOpen( true );
	}, [ dispatch ] );

	const closeExampleReportModal = useCallback( () => {
		setIsExampleReportModalOpen( false );
	}, [] );

	const buildReportButton = useMemo( () => {
		return (
			<div className="reports-overview__buttons-container">
				<Button
					variant="primary"
					className="reports-overview__button"
					onClick={ handleBuildReport }
				>
					{ translate( 'Build a new report' ) }
				</Button>
				<Button
					variant="secondary"
					className="reports-overview__button"
					onClick={ handleExampleReport }
				>
					{ translate( 'View example report' ) }
				</Button>
			</div>
		);
	}, [ translate, handleBuildReport, handleExampleReport ] );

	return (
		<Layout className="reports-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" onClick={ handleBuildReport }>
							{ translate( 'Build a new report' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="reports-overview__body">
				<PageSectionColumns>
					<PageSectionColumns.Column>
						<div className="reports-overview__content">
							<div>
								<div className="reports-overview__heading">
									{ translate( 'Create professional reports for your clients' ) }
								</div>
								<div className="reports-overview__description">
									{ translate(
										"Prove your agency's impact with polished, easy-to-read reports. Pull in traffic stats, security checks, and performance metrics automatically, then send a snapshot that keeps clients informed, impressed, and confident in the work you do each month."
									) }
								</div>
							</div>
							{ buildReportButton }
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ heroImage } alt="Reports & Analytics" />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns
					background={ {
						isDarkBackground: true,
						color: '#185683',
					} }
				>
					<PageSectionColumns.Column heading={ translate( 'Why share reports?' ) }>
						<div className="reports-overview__description">
							<div>
								{ translate(
									'Reports turn raw data into clear stories. They highlight progress, justify fees, and create regular touchpoints that spark new goals. Each delivery invites a conversation, making upsells or scope expansion a natural, value-based next step for both sides.'
								) }
							</div>
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ whyImage } alt="Client Reports" />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns heading={ translate( 'Benefits of client reporting' ) }>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ listItems1 } />
					</PageSectionColumns.Column>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ listItems2 } />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns
					background={ {
						color: '#EBF7FF',
					} }
				>
					<PageSectionColumns.Column
						heading={ translate( 'Ready to create your first client report?' ) }
					>
						<>
							<div className="reports-overview__description">
								{ translate(
									"Our streamlined report builder makes it easy to create professional client reports in minutes. Simply select what information to include, and click send! We'll handle the rest."
								) }
							</div>
							<div className="reports-overview__buttons-container">
								<Button __next40pxDefaultSize variant="primary" onClick={ handleBuildReport }>
									{ translate( 'Build a new report' ) }
								</Button>
							</div>
						</>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ readyImage } alt="Reports & Analytics" />
					</PageSectionColumns.Column>
				</PageSectionColumns>
			</LayoutBody>
			{ isExampleReportModalOpen && (
				<Modal
					title={ translate( 'Example client report' ) }
					onRequestClose={ closeExampleReportModal }
					className="reports-overview__example-report-modal"
					bodyOpenClassName="reports-overview__example-report-modal-body"
					isFullScreen
				>
					<ExampleReport />
				</Modal>
			) }
		</Layout>
	);
};

export default ReportsOverview;

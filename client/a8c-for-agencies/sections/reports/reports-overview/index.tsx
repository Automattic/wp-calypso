import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
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
import BuildReportModal from '../components/build-report-modal';

import './style.scss';

const ReportsOverview = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isModalOpen, setModalOpen ] = useState( false );

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
		setModalOpen( true );
	}, [ dispatch ] );

	const closeModal = useCallback( () => {
		setModalOpen( false );
	}, [] );

	const buildReportButton = useMemo( () => {
		return (
			<Button __next40pxDefaultSize variant="primary" onClick={ handleBuildReport }>
				{ translate( 'Build a new report' ) }
			</Button>
		);
	}, [ translate, handleBuildReport ] );

	return (
		<Layout className="reports-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						{ buildReportButton }
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<PageSectionColumns>
					<PageSectionColumns.Column>
						<div className="reports-overview__content">
							<div>
								<div className="reports-overview__heading">
									{ translate( 'Create professional reports for your clients' ) }
								</div>
								<div className="reports-overview__description">
									{ translate(
										"Show your clients the value you provide with beautiful, comprehensive reports. Include statistics, security measures, and performance data from their sites to demonstrate your agency's ongoing work."
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
						color: '#153E5F',
					} }
				>
					<PageSectionColumns.Column heading={ translate( 'Why create client reports' ) }>
						<div className="reports-overview__description">
							<div>
								{ translate(
									'Client reports help demonstrate the ongoing value of your services. They provide transparent insight into the work you do and the results you achieve, which helps build trust and justify your fees.'
								) }
							</div>
							<div>
								{ translate(
									'Regular reporting also creates touchpoints with your clients, opening the door for meaningful conversations about their goals and providing opportunities for upselling additional services.'
								) }
							</div>
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ whyImage } alt="Client Reports" />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns
					heading={ translate( 'Benefits of client reporting' ) }
					background={ {
						color: '#f6f7f7',
					} }
				>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ listItems1 } />
					</PageSectionColumns.Column>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ listItems2 } />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns>
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

				<BuildReportModal isOpen={ isModalOpen } onClose={ closeModal } />
			</LayoutBody>
		</Layout>
	);
};

export default ReportsOverview;

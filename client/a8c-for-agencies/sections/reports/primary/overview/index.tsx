import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
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
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function ReportsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Client Reports' );

	const benefitsList1 = useMemo(
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

	const benefitsList2 = useMemo(
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

	const handleBuildNewReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_build_new_report_button_click' ) );
		// Build new report action - placeholder
		// This would typically open report builder or navigate to creation flow
	}, [ dispatch ] );

	const handleViewExampleReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_view_example_report_button_click' ) );
		// View example report action - placeholder
		// This would typically open a modal or navigate to example report
	}, [ dispatch ] );

	const buildNewReportButton = useMemo( () => {
		return (
			<Button __next40pxDefaultSize variant="primary" onClick={ handleBuildNewReport }>
				{ translate( 'Build a new report' ) }
			</Button>
		);
	}, [ translate, handleBuildNewReport ] );

	return (
		<Layout className="reports-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						{ buildNewReportButton }
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
										"Prove your agency's impact with polished, easy-to-read reports. Pull in traffic stats, security checks, and performance metrics automatically, then send a snapshot that keeps clients informed, impressed, and confident in the work you do each month."
									) }
								</div>
							</div>
							{ buildNewReportButton }
						</div>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ heroImage } alt="" />
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
							{ translate(
								'Reports turn raw data into clear stories. They highlight progress, justify fees, and create regular touchpoints that spark new goals. Each delivery invites a conversation, making upsells or scope expansion a natural, value-based next step for both sides.'
							) }
						</div>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							className="reports-overview__button"
							onClick={ handleViewExampleReport }
						>
							{ translate( 'View an example report' ) }
						</Button>
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ whyImage } alt="" />
					</PageSectionColumns.Column>
				</PageSectionColumns>

				<PageSectionColumns heading={ translate( 'Benefits of client reporting' ) }>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ benefitsList1 } />
					</PageSectionColumns.Column>
					<PageSectionColumns.Column>
						<SimpleList className="reports-overview__list" items={ benefitsList2 } />
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
						<div className="reports-overview__description">
							{ translate(
								"Our streamlined report builder makes it easy to create professional client reports in minutes. Simply select what information to include, and click Send! We'll handle the rest."
							) }
						</div>
						{ buildNewReportButton }
					</PageSectionColumns.Column>
					<PageSectionColumns.Column alignCenter>
						<img src={ readyImage } alt="" />
					</PageSectionColumns.Column>
				</PageSectionColumns>
			</LayoutBody>
		</Layout>
	);
}

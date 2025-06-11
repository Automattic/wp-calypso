import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { A4A_REPORTS_BUILD_LINK } from '../../constants';

const ReportsDashboardEmptyState = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleBuildNewReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_empty_state_build_new_report_click' ) );
	}, [ dispatch ] );

	const handleViewExampleReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_empty_state_view_example_report_click' ) );
		// View example report action - placeholder for future implementation
	}, [ dispatch ] );

	return (
		<div className="reports-dashboard-empty-state__content">
			<div>
				<div className="reports-dashboard-empty-state__heading">
					{ translate( 'Create detailed reports for your clients' ) }
				</div>
				<div className="reports-dashboard-empty-state__description">
					{ translate(
						'Build professional reports in three simple steps. Include website stats, showcase your value, and keep clients informed.'
					) }
				</div>
			</div>
			<StepSection heading={ translate( 'How to get started' ) }>
				<StepSectionItem
					heading={ translate( 'Create your first report' ) }
					description={ translate(
						'Choose a site, select the content to include, add a personal message, then preview and send it to your client.'
					) }
				>
					<div className="reports-dashboard-empty-state__buttons">
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ handleBuildNewReport }
							href={ A4A_REPORTS_BUILD_LINK }
						>
							{ translate( 'Build a new report' ) }
						</Button>
						<Button __next40pxDefaultSize variant="secondary" onClick={ handleViewExampleReport }>
							{ translate( 'View example report' ) }
						</Button>
					</div>
				</StepSectionItem>
			</StepSection>
		</div>
	);
};

export default ReportsDashboardEmptyState;

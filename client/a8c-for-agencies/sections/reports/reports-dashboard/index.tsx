import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';

import './style.scss';

export default function ReportsDashboard() {
	const translate = useTranslate();
	const pageTitle = translate( 'Reports Dashboard' );

	return (
		<Layout title={ pageTitle } wide>
			<LayoutBody className="reports-dashboard-content">
				<div style={ { padding: 32 } }>
					<h1>{ pageTitle }</h1>
					<p>{ translate( 'This is the Reports Dashboard section. Content coming soon.' ) }</p>
				</div>
			</LayoutBody>
		</Layout>
	);
}

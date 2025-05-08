import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';

import './style.scss';

export default function ReportsComponent() {
	const translate = useTranslate();
	const title = translate( 'Reports' );

	return (
		<Layout title={ title } wide>
			<LayoutBody className="a4a-reports-content">
				<div style={ { padding: 32 } }>
					<h1>{ title }</h1>
					<p>{ translate( 'This is the Reports section. Content coming soon.' ) }</p>
				</div>
			</LayoutBody>
		</Layout>
	);
}

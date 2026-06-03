import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import heroImage from 'calypso/assets/images/a8c-for-agencies/reports/report-mock.webp';

import './style.scss';

type Props = {
	ctas: ReactNode;
};

export default function ReportsBanner( { ctas }: Props ) {
	const translate = useTranslate();

	return (
		<PageSectionColumns className="reports-banner__section">
			<PageSectionColumns.Column>
				<div className="reports-banner__content">
					<div>
						<div className="reports-banner__heading">
							{ translate( 'Create professional reports for your clients' ) }
						</div>
						<div className="reports-banner__description">
							{ translate(
								"Prove your agency's impact with polished, easy-to-read reports. Highlight key traffic stats (more data types coming soon) and send monthly snapshots that keep clients informed, impressed, and confident in your work."
							) }
						</div>
					</div>
					{ ctas }
				</div>
			</PageSectionColumns.Column>
			<PageSectionColumns.Column alignCenter>
				<img src={ heroImage } alt="" />
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}

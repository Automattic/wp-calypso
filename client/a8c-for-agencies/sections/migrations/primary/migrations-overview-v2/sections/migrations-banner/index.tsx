import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import PressablePremiumPlanMigrationBanner from 'calypso/a8c-for-agencies/components/pressable-premium-plan-migration/banner';

import './style.scss';

export default function MigrationsBanner() {
	const translate = useTranslate();

	return (
		<PageSection
			className="migrations-banner__section"
			heading={ translate(
				'Migrate your client sites to superior WordPress{{br/}}hosting with Automattic',
				{
					components: {
						br: <br />,
					},
				}
			) }
		>
			<PressablePremiumPlanMigrationBanner isCollapsable={ false } source="migrations-overview" />
			<div />
		</PageSection>
	);
}

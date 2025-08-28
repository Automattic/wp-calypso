import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType5 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import PressablePremiumPlanMigrationBanner from 'calypso/a8c-for-agencies/components/pressable-premium-plan-migration/banner';

import './style.scss';

export default function MigrationsBanner() {
	const translate = useTranslate();

	return (
		<PageSection
			heading={ translate(
				'Migrate your client sites to superior WordPress{{br/}}hosting with Automattic',
				{
					components: {
						br: <br />,
					},
				}
			) }
			background={ BackgroundType5 }
		>
			<PressablePremiumPlanMigrationBanner isCollapsable={ false } />
			<div />
		</PageSection>
	);
}

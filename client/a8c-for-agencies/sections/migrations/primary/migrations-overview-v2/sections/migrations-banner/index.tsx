import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import PressablePremiumPlanMigrationBanner from 'calypso/a8c-for-agencies/components/pressable-premium-plan-migration/banner';

import './style.scss';

type Props = {
	isCompact?: boolean;
};

export default function MigrationsBanner( { isCompact }: Props ) {
	const translate = useTranslate();

	return (
		<PageSection
			className={ clsx( 'migrations-banner__section', { 'is-compact': isCompact } ) }
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

import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import MigrationOfferV3 from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v3';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType5 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';

import './style.scss';

export default function MigrationsBanner() {
	const translate = useTranslate();
	const [ isMigrationOfferExpanded, setIsMigrationOfferExpanded ] = useState( true );

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
			<MigrationOfferV3
				isExpanded={ isMigrationOfferExpanded }
				onToggleView={ () => setIsMigrationOfferExpanded( ( prev ) => ! prev ) }
			/>
		</PageSection>
	);
}

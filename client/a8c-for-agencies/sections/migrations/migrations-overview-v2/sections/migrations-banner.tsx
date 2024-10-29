import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType1 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';

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
			background={ BackgroundType1 }
		>
			BANNER HERE
		</PageSection>
	);
}

import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType3 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';

export default function MigrationsCTA() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'Let’s get your clients on better hosting' ) }
			description={ translate( 'Ready to make the switch? Let’s get started.' ) }
			background={ BackgroundType3 }
		>
			CTA HERE
		</PageSection>
	);
}

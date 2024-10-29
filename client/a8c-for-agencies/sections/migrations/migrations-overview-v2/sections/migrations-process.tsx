import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType3 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';

export default function MigrationsProcess() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'We’ll migrate your sites for you' ) }
			description={ translate( 'Transfer your WordPress websites hassle-free with our help.' ) }
			background={ BackgroundType3 }
		>
			MIGRATIONS PROCESS HERE
		</PageSection>
	);
}

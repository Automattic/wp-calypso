import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';

export default function MigrationsHostingOptions() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'Unsure which host suits your needs?' ) }
			description={ translate( 'Take WordPress.com and Pressable for a spin.' ) }
		>
			HOSTING OPTIONS HERE
		</PageSection>
	);
}

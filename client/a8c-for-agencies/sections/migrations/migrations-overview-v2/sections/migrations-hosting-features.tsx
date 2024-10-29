import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';

export default function MigrationsHostingFeatures() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'Best-in-class WordPress hosting' ) }
			description={ translate(
				'WordPress.com and Pressable are powered by WP Cloud, the only cloud platform optimized for WordPress.'
			) }
		>
			HOSTING FEATURES HERE
		</PageSection>
	);
}

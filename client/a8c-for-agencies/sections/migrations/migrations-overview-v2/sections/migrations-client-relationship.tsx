import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';

export default function MigrationsClientRelationship() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'Improve your client relationships with our hosting' ) }
			description={ translate( 'Our hosting platform is built exclusively for WordPress.' ) }
		>
			CLIENT RELATIONSHIP HERE
		</PageSection>
	);
}

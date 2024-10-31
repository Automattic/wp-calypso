import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';

export default function MigrationsFAQs() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'Frequently asked questions' ) }
			description={ translate( 'Curious about the details? We’ve got answers.' ) }
		>
			FAQS HERE
		</PageSection>
	);
}

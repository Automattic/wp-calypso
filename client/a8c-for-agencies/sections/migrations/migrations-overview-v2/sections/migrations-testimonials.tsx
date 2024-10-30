import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType2 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';

export default function MigrationsTestimonials() {
	const translate = useTranslate();
	return (
		<PageSection
			heading={ translate( 'You’re in good company' ) }
			description={ translate( 'Don’t just take our word for it. Hear from our customers.' ) }
			background={ BackgroundType2 }
		>
			TESTIMONIALS HERE
		</PageSection>
	);
}

import { useTranslate } from 'i18n-calypso';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { preventWidows } from 'calypso/lib/formatting';

export default function MigrationsCommissionsEmptyState() {
	const translate = useTranslate();

	return (
		<StepSection heading={ translate( 'View your migrated websites and commissions right here.' ) }>
			<StepSectionItem
				heading={ translate( "We'll tag the sites we moved for you once they're transferred." ) }
				description={ preventWidows(
					translate(
						"If you picked the concierge service, we'll move your sites for you. Once we're done, you'll see them here, and they'll add to your commissions."
					)
				) }
			/>
		</StepSection>
	);
}

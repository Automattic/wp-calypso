import { __ } from '@wordpress/i18n';
import domainUpsellUrl from './domain-upsell-illustration.svg';
import UpsellWithActionCard from './upsell-with-action-card';

export default function DomainUpsellCard() {
	return (
		<UpsellWithActionCard
			actionText={ __( 'Get this domain' ) }
			actionVariant="primary"
			description="xxx"
			image={ domainUpsellUrl }
			imageAlt=""
			title={ __( 'The perfect domain awaits' ) }
			trackId="domain-upsell"
		/>
	);
}

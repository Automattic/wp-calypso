import { __ } from '@wordpress/i18n';
import UpsellWithActionCard from '../overview/upsell-with-action-card';
import domainUpsellUrl from './upsell-card-illustration.svg';

export default function DomainUpsellCard() {
	return (
		<UpsellWithActionCard
			actionText={ __( 'Get this domain' ) }
			actionVariant="primary"
			description="xxx"
			image={ domainUpsellUrl }
			imageAlt={ __( 'Browser window with a domain name' ) }
			title={ __( 'The perfect domain awaits' ) }
			trackId="domain-upsell"
		/>
	);
}

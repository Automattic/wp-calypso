import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationTransferDomainUrl from './upsell-illustration-transfer-domain.svg';

export default function DomainTransferUpsellCard() {
	return (
		<Callout
			title={ __( 'Transfer your domain' ) }
			titleAs="h2"
			description={
				<Text variant="muted">
					{ __(
						'Transfer your domain and benefit from some of the lowest prices in the business.'
					) }
				</Text>
			}
			image={ illustrationTransferDomainUrl }
			imageVariant="full-bleed"
			actions={
				<UpsellCTAButton
					href="/setup/domain-transfer"
					text={ __( 'Transfer domain' ) }
					size="compact"
					tracksId="transfer-domain"
					variant="secondary"
				/>
			}
		/>
	);
}

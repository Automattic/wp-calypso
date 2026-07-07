import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { getCurrentDashboard } from '../../app/routing';
import { Callout } from '../../components/callout';
import { ThemedIllustration } from '../../components/themed-illustration';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { wpcomLink } from '../../utils/link';
import illustrationTransferDomainDarkUrl from './upsell-illustration-transfer-domain-dark.svg';
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
			image={
				<ThemedIllustration
					light={ illustrationTransferDomainUrl }
					dark={ illustrationTransferDomainDarkUrl }
				/>
			}
			imageVariant="full-bleed"
			actions={
				<UpsellCTAButton
					href={ addQueryArgs( wpcomLink( '/setup/domain-transfer' ), {
						dashboard: getCurrentDashboard(),
					} ) }
					text={ __( 'Transfer domain' ) }
					size="compact"
					upsellId="site-overview-transfer-domain"
					upsellFeatureId="domain"
					variant="secondary"
				/>
			}
		/>
	);
}

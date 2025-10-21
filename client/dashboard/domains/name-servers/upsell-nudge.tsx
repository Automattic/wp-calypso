import { SETTING_PRIMARY_DOMAIN } from '@automattic/urls';
import { __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import InlineSupportLink from '../../components/inline-support-link';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from './upsell-nudge-illustration.svg';

interface Props {
	domainName: string;
	domainSiteSlug: string;
}

export default function UpsellNudge( { domainName, domainSiteSlug }: Props ) {
	return (
		<Callout
			title={ sprintf(
				/* translators: %s is the domain name */
				__( 'This domain is being forwarded to %s' ),
				domainSiteSlug
			) }
			image={ illustrationUrl }
			variant="highlight"
			description={
				<Text as="p">
					{ createInterpolateElement(
						__(
							'Upgrade to a paid plan to make <domain /> the primary address that your visitors see when they visit your site.<br /><learnMore />'
						),
						{
							br: <br />,
							domain: <strong>{ domainName }</strong>,
							learnMore: <InlineSupportLink supportLink={ SETTING_PRIMARY_DOMAIN } />,
						}
					) }
				</Text>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					upsellId="domain-nameservers-primary-domain"
					upsellFeatureId="domain"
					variant="primary"
					href={ `/checkout/${ domainSiteSlug }/business` }
				/>
			}
		/>
	);
}

import { __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from './upsell-nudge-illustration.svg';

interface Props {
	domainName: string;
}

export default function UpsaleNudge( { domainName }: Props ) {
	return (
		<Callout
			title={ sprintf(
				/* translators: %s is the domain name */
				__( 'This domain is being forwarded to %s' ),
				domainName
			) }
			image={ illustrationUrl }
			variant="highlight"
			description={
				<Text as="p">
					{ createInterpolateElement(
						sprintf(
							// translators: %(domain)s is the domain name
							__(
								'Upgrade to a paid plan to make <strong>%s</strong> the primary address that your visitors see when they visit your site.<br /><a>Learn more</a>'
							),
							domainName
						),
						{
							br: <br />,
							strong: <strong>{ domainName }</strong>,
							a: <a href="https://wordpress.com/" target="_blank" rel="noopener noreferrer" />,
						}
					) }
				</Text>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="dseployments"
					variant="primary"
					href={ `/checkout/${ domainName }/business` }
				/>
			}
		/>
	);
}

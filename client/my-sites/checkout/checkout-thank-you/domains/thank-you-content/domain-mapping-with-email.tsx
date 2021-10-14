import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';
import { getTitanEmailUrl } from 'calypso/lib/titan';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { DomainThankYouParams, DomainThankYouProps } from '../types';

const DomainMappingWithEmailThankYouProps = ( {
	selectedSiteSlug,
	domain,
	email,
}: DomainThankYouParams ): DomainThankYouProps => ( {
	sections: [
		{
			sectionKey: 'domain_mapping_whats_next',
			sectionTitle: translate( 'What’s next?' ),
			nextSteps: [
				{
					stepKey: 'domain_mapping_whats_next_plugin_setup',
					stepTitle: translate( 'Connect your domain' ),
					stepDescription: translate( 'Set up your connection by following our suggested setup.' ),
					stepCta: (
						<Button
							href={ domainMappingSetup( selectedSiteSlug, domain ) }
							className={ 'domain-mapping__thank-you-button domain-thank-you__button' }
							primary
							busy={ false }
							disabled={ false }
						>
							{ translate( 'Go to setup' ) }
						</Button>
					),
				},
				{
					stepKey: 'domain_mapping_whats_next_plugin_setup_view_inbox',
					stepTitle: translate( 'Access your inbox' ),
					stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
					stepCta: (
						<FullWidthButton
							href={ getTitanEmailUrl( email ) }
							target="_blank"
							onClick={ () => {
								recordEmailAppLaunchEvent( {
									provider: 'titan',
									app: 'webmail',
									context: 'checkout-thank-you',
								} );
							} }
						>
							{ translate( 'Go to Inbox' ) }
							<Gridicon className="titan-set-up-thank-you__icon-external" icon="external" />
						</FullWidthButton>
					),
				},
			],
		},
	],
	thankYouImage: { alt: translate( 'Domain Connected' ), src: domainConnectedSuccess },
	thankYouTitle: translate( 'Congratulations on your purchase!' ),
	thankYouSubtitle: translate( 'You can now connect {{strong}}%(domain)s{{/strong}} to your site', {
		args: {
			domain,
		},
		components: { strong: <strong /> },
	} ),
} );

export default DomainMappingWithEmailThankYouProps;

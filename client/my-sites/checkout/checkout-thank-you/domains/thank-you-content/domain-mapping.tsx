import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { DomainThankYouProps } from '../types';

const domainMappingThankYouProps = (
	selectedSiteSlug: string,
	domain: string
): DomainThankYouProps => ( {
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
					stepKey: 'domain_mapping_whats_next_view_posts',
					stepTitle: translate( 'Add Professional Email' ),
					stepDescription: translate(
						'Add a custom email address to send and receive emails from %(domain)s today.',
						{
							args: {
								domain,
							},
						}
					),
					stepCta: (
						<Button
							href={ emailManagementPurchaseNewEmailAccount( selectedSiteSlug, domain ) }
							className={ 'domain-mapping__thank-you-button domain-thank-you__button' }
							busy={ false }
							disabled={ false }
						>
							{ translate( 'Add email' ) }
						</Button>
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

export default domainMappingThankYouProps;

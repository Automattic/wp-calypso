import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';
import { ThankYouProps } from 'calypso/components/thank-you/types';
import { domainManagementList } from 'calypso/my-sites/domains/paths';

type DomainThankYouProps = Required<
	Pick< ThankYouProps, 'thankYouTitle' | 'thankYouSubtitle' | 'sections' | 'thankYouImage' >
>;

const domainTransferThankYouProps = (
	selectedSiteSlug: string,
	domain: string
): DomainThankYouProps => ( {
	sections: [
		{
			sectionKey: 'domain_transfer_whats_next',
			sectionTitle: translate( 'What’s next?' ),
			nextSteps: [
				{
					stepKey: 'domain_transfer_whats_next_wait_transfer',
					stepTitle: translate( 'Wait for transfer to complete' ),
					stepDescription: translate(
						'We’ll send you an email to youremail@gmail.com when the transfer process is complete. You can always see the status in Site Domains.'
					),
					stepCta: (
						<Button
							href={ domainManagementList( selectedSiteSlug ) }
							className={ 'domain-transfer__thank-you-button domain-thank-you__button' }
							primary
							busy={ false }
							disabled={ false }
						>
							{ translate( 'View site domains' ) }
						</Button>
					),
				},
				{
					stepKey: 'domain_transfer_whats_next_transfer_info',
					stepTitle: translate( 'Connect the domain to your site' ),
					stepDescription: translate(
						'Once the transfer is done you can can point %(domain)s to your WordPress.com site.',
						{
							args: {
								domain,
							},
						}
					),
					stepCta: null,
				},
			],
		},
	],
	thankYouImage: { alt: translate( 'Domain Transferred' ), src: domainConnectedSuccess },
	thankYouTitle: translate( 'Congratulations on your purchase!' ),
	thankYouSubtitle: translate(
		'Your domain {{strong}}%(domain)s{{/strong}} is being transferred to your site',
		{
			args: {
				domain,
			},
			components: { strong: <strong /> },
		}
	),
} );

export default domainTransferThankYouProps;

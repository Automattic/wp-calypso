import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import domainTransferredSuccess from 'calypso/assets/images/illustrations/domain-transferred-success.svg';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { DomainThankYouParams, DomainThankYouProps } from '../types';

const domainTransferThankYouProps = ( {
	selectedSiteSlug,
	domain,
	email,
}: DomainThankYouParams ): DomainThankYouProps => ( {
	thankYouNotice: {
		noticeTitle: translate( 'The transfer process can take up to 5 days to complete' ),
		noticeIcon: 'info',
	},
	sections: [
		{
			sectionKey: 'domain_transfer_whats_next',
			sectionTitle: translate( 'What’s next?' ),
			nextSteps: [
				{
					stepKey: 'domain_transfer_whats_next_wait_transfer',
					stepTitle: translate( 'Wait for transfer to complete' ),
					stepDescription: translate(
						'We’ll send you an email to %(email)s when the transfer process is complete. You can always see the status in {{i}}Site Domains{{/i}}.',
						{
							components: { i: <i /> },
							args: {
								email,
							},
						}
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
	thankYouImage: { alt: translate( 'Domain Transferred' ), src: domainTransferredSuccess },
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

import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import domainTransferredSuccess from 'calypso/assets/images/domains/transfer.svg';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type {
	DomainThankYouParams,
	DomainThankYouProps,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const domainTransferThankYouProps = ( {
	domain,
	email,
	selectedSiteSlug,
}: DomainThankYouParams ): DomainThankYouProps => ( {
	thankYouNotice: {
		noticeTitle: translate( 'The transfer process can take up to 5 days to complete' ),
		noticeIconCustom: <Icon icon={ info } size={ 24 } />,
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
						<FullWidthButton
							href={ domainManagementList( selectedSiteSlug ) }
							primary
							busy={ false }
							disabled={ false }
						>
							{ translate( 'View site domains' ) }
						</FullWidthButton>
					),
				},
				{
					stepKey: 'domain_transfer_whats_next_transfer_info',
					stepTitle: translate( 'Point the domain to your site' ),
					stepDescription: translate(
						'Once the transfer is done you can point %(domain)s to your WordPress.com site.',
						{
							args: {
								domain,
							},
						}
					),
					stepCta: (
						<FullWidthButton
							href={ localizeUrl(
								'https://wordpress.com/support/move-domain/incoming-domain-transfer/#changing-the-dns-records-after-a-successful-transfer'
							) }
							className={ 'domain-transfer__thank-you-button domain-thank-you__button' }
							busy={ false }
							disabled={ false }
						>
							{ translate( 'Learn more' ) }
						</FullWidthButton>
					),
				},
				{
					stepKey: 'domain_transfer_whats_next_transfer_info',
					stepTitle: translate( 'Connect other services' ),
					stepDescription: translate(
						'Once the transfer is done you can connect other services to this domain.'
					),
					stepCta: (
						<FullWidthButton
							href={ localizeUrl( 'https://wordpress.com/support/add-email' ) }
							className={ 'domain-transfer__thank-you-button domain-thank-you__button' }
							busy={ false }
							disabled={ false }
						>
							{ translate( 'Learn more' ) }
						</FullWidthButton>
					),
				},
			],
		},
	],
	thankYouImage: {
		alt: translate( 'Domain Transferred' ),
		src: domainTransferredSuccess,
		width: '150px',
		height: 'auto',
	},
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

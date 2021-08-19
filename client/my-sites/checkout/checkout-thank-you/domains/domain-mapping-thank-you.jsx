/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';
/**
 * Internal dependencies
 */
import { ThankYou } from 'calypso/components/thank-you';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';

/**
 * style dependencies
 */
import './style.scss';

const DomainMappingThankYou = ( { domainName: domain, selectedSite } ) => {
	const translate = useTranslate();
	return (
		<ThankYou
			containerClassName="checkout-thank-you__domains"
			sections={ [
				{
					sectionKey: 'domain_mapping_whats_next',
					sectionTitle: translate( 'What’s next?' ),
					nextSteps: [
						{
							stepKey: 'domain_mapping_whats_next_plugin_setup',
							stepTitle: translate( 'Connect your domain' ),
							stepDescription: translate(
								'Set up your connection by following our suggested setup.'
							),
							stepCta: (
								<Button
									href={ domainMappingSetup( selectedSite.slug, domain ) }
									className={ 'domain-mapping-thank-you__button' }
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
									href={ emailManagementPurchaseNewEmailAccount( selectedSite.slug, domain.name ) }
									className={ 'domain-mapping-thank-you__button' }
									busy={ false }
									disabled={ false }
								>
									{ translate( 'Add email' ) }
								</Button>
							),
						},
					],
				},
			] }
			showSupportSection={ true }
			customSupportSection={ {
				description: 'Have questions? Our Happiness Engineers are here if you need help.',
				links: [
					{
						href: CALYPSO_CONTACT,
						title: 'Ask a question',
					},
					{
						href: SUPPORT_ROOT,
						title: 'View support documentation',
					},
				],
			} }
			thankYouImage={ { alt: 'Domain Connected', src: domainConnectedSuccess } }
			thankYouTitle={ translate( 'Congratulations on your purchase!' ) }
			thankYouSubtitle={ translate(
				'You can now connect {{strong}}%(domain)s{{/strong}} to your site',
				{
					args: {
						domain,
					},
					components: { strong: <strong /> },
				}
			) }
		/>
	);
};

export default DomainMappingThankYou;

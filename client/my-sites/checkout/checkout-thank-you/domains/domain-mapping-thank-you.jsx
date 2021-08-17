/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

import { ThankYou } from 'calypso/components/thank-you';

import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import { Button } from '@automattic/components';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';

import './style.scss';

const DomainMappingThankYou = ( { domain, translate } ) => {
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
								'Setup your connection by following our suggested setup.'
							),
							stepCta: (
								<Button
									href={ '#' }
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
							stepTitle: translate( 'Get a profesional email' ),
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
									href={ '#' }
									className={ 'domain-mapping-thank-you__button' }
									busy={ false }
									disabled={ false }
								>
									{ translate( 'Get email' ) }
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

export default localize( DomainMappingThankYou );

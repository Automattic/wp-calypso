/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

import { ThankYou } from 'calypso/components/thank-you';
import { Button } from '@automattic/components';

const DomainMappingThankYou = ( { translate } ) => {
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
									// TODO: Menu links are not properly loading on initial request, post transfer so yoastSeoPageUrl will remain empty post transfer
									// This should be fixed with perhaps a work around to periodically poll for the menu with various domains until it loads
									// or maybe blocking the user from entering this flow until a domain acquires SSL
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
								'Add a custom email address to send and receive emails from travelingwithkids.com today.'
							),
							stepCta: (
								<Button
									href={ '#' }
									className={ 'domain-mapping-thank-you__button' }
									busy={ false }
									// TODO: Menu links are not properly loading on initial request, post transfer so yoastSeoPageUrl will remain empty post transfer
									// This should be fixed with perhaps a work around to periodically poll for the menu with various domains until it loads
									// or maybe blocking the user from entering this flow until a domain acquires SSL
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
			thankYouImage={ { alt: '', src: '' } }
			/* TODO: Change thank you message to be dynamic according to product */
			thankYouTitle={ translate( 'Congratulations on your purchase!' ) }
		/>
	);
};

export default localize( DomainMappingThankYou );

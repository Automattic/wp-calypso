import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-success.svg';
import { buildCtaForProfessionalEmail } from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { DomainThankYouParams, DomainThankYouProps } from '../types';

const DomainRegistrationThankYouProps = ( {
	selectedSiteSlug,
	domain,
	email,
	hasProfessionalEmail,
}: DomainThankYouParams ): DomainThankYouProps => {
	const profesisonalEmail = buildCtaForProfessionalEmail(
		{
			domain,
			email,
			hasProfessionalEmail,
			selectedSiteSlug,
		},
		'registration',
		false
	);

	const returnProps: DomainThankYouProps = {
		sections: [
			{
				sectionKey: 'domain_registration_whats_next',
				sectionTitle: translate( 'What’s next?' ),
				nextSteps: [
					{
						stepKey: 'domain_registration_whats_next_plugin_setup',
						stepTitle: translate( 'Organize your domains' ),
						stepDescription: translate(
							'Set up a primary domain, connect other domains and make sure people can find your site'
						),
						stepCta: (
							<Button
								href={ domainMappingSetup( selectedSiteSlug, domain ) }
								className={ 'domain-registration__thank-you-button domain-thank-you__button' }
								primary
								busy={ false }
								disabled={ false }
							>
								{ translate( 'Manage domains' ) }
							</Button>
						),
					},
					profesisonalEmail,
				],
			},
		],
		thankYouImage: { alt: translate( 'Domain Connected' ), src: domainConnectedSuccess },
		thankYouTitle: translate( 'Congratulations on your purchase!' ),
		thankYouSubtitle: translate(
			'You can now connect {{strong}}%(domain)s{{/strong}} to your site',
			{
				args: {
					domain,
				},
				components: { strong: <strong /> },
			}
		),
	};
	return returnProps;
};

export default DomainRegistrationThankYouProps;

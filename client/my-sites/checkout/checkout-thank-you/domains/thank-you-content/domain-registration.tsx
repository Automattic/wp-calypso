import { translate } from 'i18n-calypso';
import domainRegisteredSuccess from 'calypso/assets/images/illustrations/domain-registration-success.svg';
import { buildDomainStepForProfessionalEmail } from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type {
	DomainThankYouParams,
	DomainThankYouProps,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const DomainRegistrationThankYouProps = ( {
	domain,
	email,
	hasProfessionalEmail,
	hideProfessionalEmailStep,
	selectedSiteSlug,
}: DomainThankYouParams ): DomainThankYouProps => {
	const professionalEmail = buildDomainStepForProfessionalEmail(
		{
			domain,
			email,
			hasProfessionalEmail,
			hideProfessionalEmailStep,
			selectedSiteSlug,
		},
		'REGISTRATION',
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
							<FullWidthButton
								href={ domainMappingSetup( selectedSiteSlug, domain ) }
								primary
								busy={ false }
								disabled={ false }
							>
								{ translate( 'Manage domains' ) }
							</FullWidthButton>
						),
					},
					professionalEmail,
				],
			},
		],
		thankYouImage: { alt: translate( 'Domain Registered' ), src: domainRegisteredSuccess },
		thankYouTitle: translate( 'Congratulations on your purchase!' ),
		thankYouSubtitle: translate(
			'Your new domain {{strong}}%(domain)s{{/strong}} is being set up.',
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

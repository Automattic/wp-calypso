import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import domainConnectedSuccess from 'calypso/assets/images/illustrations/domain-connected-success.svg';
import { buildDomainStepForProfessionalEmail } from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import type {
	DomainThankYouParams,
	DomainThankYouProps,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const domainMappingThankYouProps = ( {
	domain,
	email,
	hasProfessionalEmail,
	selectedSiteSlug,
}: DomainThankYouParams ): DomainThankYouProps => {
	const professionalEmail = buildDomainStepForProfessionalEmail(
		{
			domain,
			email,
			hasProfessionalEmail,
			selectedSiteSlug,
		},
		'MAPPING',
		false
	);

	const returnProps: DomainThankYouProps = {
		sections: [
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
					professionalEmail,
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

export default domainMappingThankYouProps;

import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import domainRegisteredSuccess from 'calypso/assets/images/domains/domain.svg';
import { buildDomainStepForProfessionalEmail } from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
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
		true
	);

	const returnProps: DomainThankYouProps = {
		thankYouNotice: {
			noticeTitle: translate(
				'During setup your domain may be unreliable during the first 30 minutes.'
			),
			noticeIconCustom: <Icon icon={ info } size={ 24 } />,
		},
		sections: [
			{
				sectionKey: 'domain_registration_whats_next',
				sectionTitle: translate( 'What’s next?' ),
				nextSteps: [
					...( professionalEmail ? [ professionalEmail ] : [] ),
					{
						stepKey: 'domain_registration_whats_next_plugin_setup',
						stepTitle: translate( 'Organize your domains' ),
						stepDescription: translate(
							'Set up a primary domain, connect other domains and make sure people can find your site'
						),
						stepCta: (
							<FullWidthButton
								href={ domainManagementList( selectedSiteSlug ?? domain, null ) }
								busy={ false }
								disabled={ false }
							>
								{ translate( 'Manage domains' ) }
							</FullWidthButton>
						),
					},
				],
			},
		],
		thankYouImage: {
			alt: translate( 'Domain Registered' ),
			src: domainRegisteredSuccess,
			width: '150px',
			height: 'auto',
		},
		thankYouTitle: translate( 'All ready to go!' ),
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

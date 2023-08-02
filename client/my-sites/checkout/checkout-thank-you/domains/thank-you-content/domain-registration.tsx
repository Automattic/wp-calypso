import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import domainRegisteredSuccess from 'calypso/assets/images/domains/domain.svg';
import {
	buildDomainStepForLaunchpadNextSteps,
	buildDomainStepForProfessionalEmail,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type {
	DomainThankYouParams,
	DomainThankYouProps,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const domainRegistrationThankYouProps = ( {
	domain,
	email,
	hasProfessionalEmail,
	hideProfessionalEmailStep,
	selectedSiteSlug,
	siteIntent,
	launchpadScreen,
	redirectTo,
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

	const launchpadNextSteps = buildDomainStepForLaunchpadNextSteps(
		siteIntent as string,
		launchpadScreen as string,
		selectedSiteSlug,
		'REGISTRATION',
		redirectTo,
		true
	);

	const viewDomainsStep = {
		stepKey: 'domain_registration_whats_next_view_domains',
		stepTitle: selectedSiteSlug
			? translate( 'Organize your domains' )
			: translate( 'Manage your domains' ),
		stepDescription: selectedSiteSlug
			? translate(
					'Set up a primary domain, connect other domains and make sure people can find your site.'
			  )
			: translate(
					'View domain settings, manage every aspect of your domain and add additional domains.'
			  ),
		stepCta: (
			<FullWidthButton href={ domainManagementList( '' ) } busy={ false } disabled={ false }>
				{ selectedSiteSlug ? translate( 'Manage domains' ) : translate( 'View your domains' ) }
			</FullWidthButton>
		),
	};

	const returnProps: DomainThankYouProps = {
		thankYouNotice: {
			noticeTitle: translate(
				'It may take up to 30 minutes for your domain to start working properly.'
			),
			noticeIconCustom: <Icon icon={ info } size={ 24 } />,
		},
		sections: [
			{
				sectionKey: 'domain_registration_whats_next',
				sectionTitle: translate( 'What’s next?' ),
				nextSteps: launchpadNextSteps
					? [ launchpadNextSteps ]
					: [ ...( professionalEmail ? [ professionalEmail ] : [] ), viewDomainsStep ],
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

export default domainRegistrationThankYouProps;

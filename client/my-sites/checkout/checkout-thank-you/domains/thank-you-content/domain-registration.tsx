import { Icon, info } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import domainRegisteredSuccess from 'calypso/assets/images/domains/domain.svg';
import {
	buildDomainStepForLaunchpadNextSteps,
	buildDomainStepForProfessionalEmail,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/index';
import { domainManagementList, createSiteFromDomainOnly } from 'calypso/my-sites/domains/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type {
	DomainThankYouParams,
	DomainThankYouProps,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const domainRegistrationThankYouProps = ( {
	domain,
	domains,
	email,
	hasProfessionalEmail,
	hideProfessionalEmailStep,
	shouldDisplayVerifyEmailStep,
	onResendEmailVerificationClick,
	selectedSiteSlug,
	siteIntent,
	launchpadScreen,
	redirectTo,
	isDomainOnly,
	selectedSiteId,
	isActivityPubEnabled,
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

	const confirmEmailStep = {
		stepKey: 'domain_registration_whats_next_confirm-email',
		stepTitle: translate( 'Confirm email address' ),
		stepDescription:
			domains.length > 1
				? translate( 'You must confirm your email address to avoid your domains being suspended.' )
				: translate(
						'You must confirm your email address to avoid your domain getting suspended.'
				  ),
		stepCta: (
			<FullWidthButton onClick={ onResendEmailVerificationClick } busy={ false } disabled={ false }>
				{ translate( 'Resend email' ) }
			</FullWidthButton>
		),
	};

	const createSiteStep = {
		stepKey: 'domain_registration_whats_next_create-site',
		stepTitle: translate( 'Add a site' ),
		stepDescription: translate( 'Choose a theme, customize and launch your site.' ),
		stepCta: (
			<FullWidthButton
				href={ createSiteFromDomainOnly( domain, selectedSiteId ) }
				busy={ false }
				disabled={ false }
			>
				{ translate( 'Create a site' ) }
			</FullWidthButton>
		),
	};

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

	const fediverseSettingsStep = {
		stepKey: 'domain_registration_whats_next_fediverse_settings',
		stepTitle: translate( 'Connect to the fediverse' ),
		stepDescription: translate(
			'You’ve unlocked a durable, portable social networking presence with your domain!'
		),
		stepCta: (
			<FullWidthButton
				href={ `/settings/discussion/${ selectedSiteSlug }` }
				busy={ false }
				disabled={ false }
			>
				{ translate( 'Fediverse settings' ) }
			</FullWidthButton>
		),
	};

	const returnProps: DomainThankYouProps = {
		thankYouNotice: {
			noticeTitle:
				domains.length > 1
					? translate( 'It may take up to 30 minutes for your domains to start working properly.' )
					: translate( 'It may take up to 30 minutes for your domain to start working properly.' ),
			noticeIconCustom: <Icon icon={ info } size={ 24 } />,
		},
		sections: [
			{
				sectionKey: 'domain_registration_whats_next',
				sectionTitle: translate( 'What’s next?' ),
				nextSteps: launchpadNextSteps
					? [ launchpadNextSteps ]
					: [
							...( shouldDisplayVerifyEmailStep ? [ confirmEmailStep ] : [] ),
							...( professionalEmail ? [ professionalEmail ] : [] ),
							...( isDomainOnly && selectedSiteId ? [ createSiteStep ] : [] ),
							...( isActivityPubEnabled ? [ fediverseSettingsStep ] : [ viewDomainsStep ] ),
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
		thankYouSubtitle:
			domains.length > 1
				? translate( 'Your new domains are being set up.' )
				: translate( 'Your new domain {{strong}}%(domain)s{{/strong}} is being set up.', {
						args: {
							domain,
						},
						components: { strong: <strong /> },
				  } ),
	};
	return returnProps;
};

export default domainRegistrationThankYouProps;

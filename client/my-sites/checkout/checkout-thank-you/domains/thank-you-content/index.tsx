import { translate } from 'i18n-calypso';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import domainMappingProps from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/domain-mapping';
import domainRegistrationThankYouProps from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/domain-registration';
import domainTransferProps from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content/domain-transfer';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import {
	emailManagementMailboxes,
	emailManagementPurchaseNewEmailAccount,
} from 'calypso/my-sites/email/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import type { ThankYouNextStepProps } from 'calypso/components/thank-you/types';
import type {
	DomainThankYouParams,
	DomainThankYouPropsGetter,
	DomainThankYouType,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';

const thankYouContentGetter: Record< DomainThankYouType, DomainThankYouPropsGetter > = {
	MAPPING: domainMappingProps,
	TRANSFER: domainTransferProps,
	REGISTRATION: domainRegistrationThankYouProps,
};

export default thankYouContentGetter;

interface StepCTAProps {
	siteName: string;
	email?: string;
	primary: boolean;
}

const StepCTA = ( { email, primary, siteName }: StepCTAProps ) => {
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();

	const redirectUrl = `${ window.location.protocol }//${
		window.location.host
	}${ emailManagementMailboxes( siteName ) }`;

	return (
		<FullWidthButton
			href={ getTitanEmailUrl( titanAppsUrlPrefix, email, true, redirectUrl ) }
			primary={ primary }
			onClick={ () => {
				recordEmailAppLaunchEvent( {
					provider: 'titan',
					app: 'webmail',
					context: 'checkout-thank-you',
				} );
			} }
		>
			{ translate( 'Your Mailboxes' ) }
		</FullWidthButton>
	);
};

/**
 * Helper function to reuse Get mailboxes/Access your mailboxes components
 */
export function buildDomainStepForProfessionalEmail(
	{
		email,
		hasProfessionalEmail,
		hideProfessionalEmailStep,
		selectedSiteSlug,
		domain,
	}: Pick<
		DomainThankYouParams,
		'email' | 'hasProfessionalEmail' | 'hideProfessionalEmailStep' | 'selectedSiteSlug' | 'domain'
	>,
	domainType: DomainThankYouType,
	primary: boolean
): ThankYouNextStepProps | null {
	if ( hideProfessionalEmailStep ) {
		return null;
	}

	if ( ! hasProfessionalEmail ) {
		return {
			stepKey: `domain_${ domainType }_whats_next_get_professional_email`,
			stepTitle: translate( 'Get a professional email' ),
			stepDescription: translate(
				'Add a custom email address to send and receive emails from %(domain)s today.',
				{
					args: {
						domain,
					},
				}
			),
			stepCta: (
				<FullWidthButton
					href={ emailManagementPurchaseNewEmailAccount( selectedSiteSlug ?? domain, domain ) }
					className={ `domain-${ domainType }__thank-you-button domain-thank-you__button` }
					primary={ primary }
					busy={ false }
					disabled={ false }
				>
					{ translate( 'Add email' ) }
				</FullWidthButton>
			),
		};
	}

	return {
		stepKey: `domain_${ domainType }_whats_next_email_setup_view_inbox`,
		stepTitle: translate( 'Access your mailboxes' ),
		stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
		stepCta: <StepCTA siteName={ selectedSiteSlug } email={ email } primary={ primary } />,
	};
}

/**
 * Redirect the user back to Launchpad after purchasing a domain
 */
export function buildDomainStepForLaunchpadNextSteps(
	siteIntent: string | undefined,
	launchpadScreen: string,
	selectedSiteSlug: string,
	domainType: DomainThankYouType,
	redirectTo: string,
	primary: boolean
): ThankYouNextStepProps | null {
	if ( launchpadScreen !== 'full' || ! siteIntent || ! selectedSiteSlug ) {
		return null;
	}

	return {
		stepKey: `domain_${ domainType }_whats_next_launchpad_next_steps`,
		stepDescription: translate(
			'You are a few steps away from bringing your site to life. Check out the next steps that will help you to launch your site.'
		),
		stepCta: (
			<FullWidthButton
				onClick={ () => {
					const redirectUrl =
						redirectTo === 'home'
							? `/home/${ selectedSiteSlug }`
							: `/setup/${ siteIntent }/launchpad?siteSlug=${ selectedSiteSlug }`;
					window.location.replace( redirectUrl );
				} }
				className={ `domain-${ domainType }__thank-you-button domain-thank-you__button` }
				primary={ primary }
				busy={ false }
				disabled={ false }
			>
				{ translate( 'Next Steps' ) }
			</FullWidthButton>
		),
	};
}

import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import { getTitanEmailUrl } from 'calypso/lib/titan';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import {
	DomainThankYouParams,
	DomainThankYouProps,
	DomainThankYouPropsGetter,
	DomainThankYouType,
} from '../types';
import DomainMappingProps from './domain-mapping';
import DomainRegistrationThankYouProps from './domain-registration';
import DomainTransferProps from './domain-transfer';

const thankYouContentGetter: Record< DomainThankYouType, DomainThankYouPropsGetter > = {
	MAPPING: DomainMappingProps,
	TRANSFER: DomainTransferProps,
	REGISTRATION: DomainRegistrationThankYouProps,
};

export default thankYouContentGetter;

/**
 * Helper function to reuse Get Inbox/Access your inbox components
 */
export function buildDomainStepForProfessionalEmail(
	{
		email,
		hasProfessionalEmail,
		hideProfessionalEmailStep,
		selectedSiteSlug,
		domain,
	}: DomainThankYouParams,
	domainType: DomainThankYouType,
	primary: boolean
): DomainThankYouProps {
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
					href={ emailManagementPurchaseNewEmailAccount( selectedSiteSlug, domain ) }
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
		stepTitle: translate( 'Access your inbox' ),
		stepDescription: translate( 'Access your email from anywhere with our webmail.' ),
		stepCta: (
			<FullWidthButton
				href={ getTitanEmailUrl( email ) }
				target="_blank"
				primary={ primary }
				onClick={ () => {
					recordEmailAppLaunchEvent( {
						provider: 'titan',
						app: 'webmail',
						context: 'checkout-thank-you',
					} );
				} }
			>
				{ translate( 'Go to Inbox' ) }
				<Gridicon className={ `domain-${ domainType }__icon-external` } icon="external" />
			</FullWidthButton>
		),
	};
}

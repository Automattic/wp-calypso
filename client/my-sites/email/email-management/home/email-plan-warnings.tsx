import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	hasUnusedMailboxWarning,
	hasGoogleAccountTOSWarning,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { getGoogleAdminWithTosUrl } from 'calypso/lib/gsuite';
import { EmailNonDomainOwnerMessage } from 'calypso/my-sites/email/email-non-domain-owner-message';
import { emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type EmailPlanWarningsProps = {
	domain: ResponseDomain;
	emailAccount: EmailAccount;
};

const WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION = 'other-user-owns-subscription';
const WARNING_CODE_OTHER_USER_OWNS_EMAIL = 'other-user-owns-email';

const EmailPlanWarnings = ( { domain, emailAccount }: EmailPlanWarningsProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug ?? '';

	const warning = emailAccount?.warnings?.[ 0 ];

	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningMessage = cannotAddEmailWarningReason?.message ?? '';
	const cannotAddEmailWarningCode = cannotAddEmailWarningReason?.code ?? null;

	const WarningMessageForCode = useMemo( () => {
		return ( props: { code: string | number | null } ) => {
			switch ( props.code ) {
				case WARNING_CODE_OTHER_USER_OWNS_EMAIL:
					return (
						<div className="email-plan-warnings__warning">
							<div className="email-plan-warnings__message">
								<span>{ cannotAddEmailWarningMessage }</span>
							</div>
						</div>
					);
				case WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION:
					return (
						<EmailNonDomainOwnerMessage
							domain={ domain }
							source={ 'email-management' }
							usePromoCard={ false }
							selectedSite={ selectedSite }
						/>
					);
				default:
					return null;
			}
		};
	}, [ cannotAddEmailWarningCode ] );

	if ( ! warning && canCurrentUserAddEmail( domain ) ) {
		return null;
	}

	let cta = null;

	if ( hasUnusedMailboxWarning( emailAccount ) && isTitanMailAccount( emailAccount ) ) {
		cta = (
			<Button
				compact
				primary
				href={ emailManagementTitanSetUpMailbox( selectedSiteSlug ?? '', domain.name ) }
			>
				{ translate( 'Set up mailbox' ) }
			</Button>
		);
	} else if ( hasGoogleAccountTOSWarning( emailAccount ) ) {
		cta = (
			<Button
				compact
				primary
				href={ getGoogleAdminWithTosUrl( domain.name ) }
				onClick={ () => {
					recordTracksEvent( 'calypso_email_management_google_workspace_accept_tos_link_click' );
				} }
				target="_blank"
			>
				{ translate( 'Finish setup' ) }
				<Gridicon icon="external" />
			</Button>
		);
	}

	return (
		<div className="email-plan-warnings__container">
			{ cannotAddEmailWarningMessage && (
				<WarningMessageForCode code={ cannotAddEmailWarningCode } />
			) }

			{ ! cannotAddEmailWarningMessage && warning && (
				<div className="email-plan-warnings__warning">
					<div className="email-plan-warnings__message">
						<span>{ warning.message }</span>
					</div>
					<div className="email-plan-warnings__cta">{ cta }</div>
				</div>
			) }
		</div>
	);
};

export default EmailPlanWarnings;

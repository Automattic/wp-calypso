import { Button, ButtonProps, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	hasUnusedMailboxWarning,
	hasGoogleAccountTOSWarning,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { getGoogleAdminWithTosUrl } from 'calypso/lib/gsuite';
import { getTitanSetUpMailboxPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { EmailPlanWarningNotice } from './email-plan-warning-notice';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type EmailPlanWarningsProps = {
	domain: ResponseDomain;
	emailAccount: EmailAccount;
	ctaBtnProps?: ButtonProps;
};

const EmailPlanWarnings = ( { domain, emailAccount, ctaBtnProps }: EmailPlanWarningsProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug ?? '';

	const requiredAction = emailAccount?.warnings?.[ 0 ];

	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningMessage = cannotAddEmailWarningReason?.message ?? '';
	if ( ! requiredAction && canCurrentUserAddEmail( domain ) ) {
		return null;
	}

	let cta = null;

	if ( hasUnusedMailboxWarning( emailAccount ) && isTitanMailAccount( emailAccount ) ) {
		cta = (
			<Button
				compact
				primary
				href={ getTitanSetUpMailboxPath( selectedSiteSlug, domain.name ) }
				{ ...ctaBtnProps }
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
				{ ...ctaBtnProps }
			>
				{ translate( 'Finish setup' ) }
				<Gridicon icon="external" />
			</Button>
		);
	}

	return (
		<div className="email-plan-warnings__container">
			<EmailPlanWarningNotice selectedSite={ selectedSite } domain={ domain } />

			{ ! cannotAddEmailWarningMessage && requiredAction && (
				<div className="email-plan-warnings__warning">
					<div className="email-plan-warnings__message">
						<span>{ requiredAction.message }</span>
					</div>
					<div className="email-plan-warnings__cta">{ cta }</div>
				</div>
			) }
		</div>
	);
};

export default EmailPlanWarnings;

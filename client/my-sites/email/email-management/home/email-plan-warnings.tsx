import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	hasUnusedMailboxWarning,
	hasGoogleAccountTOSWarning,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { getGoogleAdminWithTosUrl } from 'calypso/lib/gsuite';
import { emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type EmailPlanWarningsProps = {
	domain: ResponseDomain;
	emailAccount: EmailAccount;
};

const EmailPlanWarnings = ( { domain, emailAccount }: EmailPlanWarningsProps ) => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const warning = emailAccount?.warnings?.[ 0 ];

	if ( ! warning && canCurrentUserAddEmail( domain ) ) {
		return null;
	}

	const cannotAddEmailReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailMessage = cannotAddEmailReason?.message ?? '';

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
			{ cannotAddEmailMessage && (
				<div className="email-plan-warnings__warning">
					<div className="email-plan-warnings__message">
						<span>{ cannotAddEmailMessage }</span>
					</div>
				</div>
			) }

			{ ! cannotAddEmailMessage && warning && (
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

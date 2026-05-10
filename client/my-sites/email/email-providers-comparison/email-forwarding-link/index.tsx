import { useTranslate } from 'i18n-calypso';
import { getCurrentUserCannotAddEmailReason, getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
} from 'calypso/lib/emails/email-provider-constants';
import { getAddEmailForwardsPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmailForwardingLinkProps = {
	selectedDomainName: string;
};

const EmailForwardingLink = ( { selectedDomainName }: EmailForwardingLinkProps ) => {
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );

	const domain = getSelectedDomain( {
		domains,
		selectedDomainName,
	} );

	if ( ! domain || ! selectedSite ) {
		return null;
	}

	if ( domain.isGravatarDomain ) {
		return null;
	}

	const hasExistingEmailForwards = hasEmailForwards( domain );
	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningCode = cannotAddEmailWarningReason?.code ?? null;
	const isEmailForwardingRestricted =
		cannotAddEmailWarningCode === EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED ||
		cannotAddEmailWarningCode === EMAIL_WARNING_CODE_GRAVATAR_DOMAIN;

	if ( hasExistingEmailForwards || isEmailForwardingRestricted ) {
		return null;
	}

	return (
		<div className="email-forwarding-link">
			{ translate( 'Looking for a free email solution? Start with {{a}}Email Forwarding{{/a}}.', {
				components: {
					a: (
						<a
							href={ getAddEmailForwardsPath( selectedSite.slug, selectedDomainName, currentRoute, {
								source: 'purchase',
							} ) }
						/>
					),
				},
			} ) }
		</div>
	);
};

export default EmailForwardingLink;

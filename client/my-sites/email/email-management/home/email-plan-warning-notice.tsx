import { SiteDetails } from '@automattic/data-stores';
import {
	isDomainAndEmailSubscriptionsOwnedByDifferentUsers,
	getCurrentUserCannotAddEmailReason,
} from 'calypso/lib/domains';
import { ResponseDomain } from 'calypso/lib/domains/types';
import {
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import { EmailDifferentDomainOwnerMessage } from 'calypso/my-sites/email/email-different-domain-owner-message';
import { EmailNonDomainOwnerMessage } from 'calypso/my-sites/email/email-non-domain-owner-message';
import { EmailNonOwnerMessage } from 'calypso/my-sites/email/email-non-owner-message';

type EmailPlanWarningNoticeProps = {
	domain: ResponseDomain;
	selectedSite: SiteDetails | null | undefined;
};

export const EmailPlanWarningNotice = ( props: EmailPlanWarningNoticeProps ) => {
	const { domain, selectedSite } = props;

	// If email and domain are owned by different users, none of the users will be able to make a purchase and the only way to resolve this
	// is to reach out to support. Therefore, we should surface a different message to address this scenario.
	if ( ! isDomainAndEmailSubscriptionsOwnedByDifferentUsers( domain ) ) {
		return <EmailDifferentDomainOwnerMessage />;
	}

	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningMessage = cannotAddEmailWarningReason?.message ?? '';
	const cannotAddEmailWarningCode = cannotAddEmailWarningReason?.code ?? null;

	switch ( cannotAddEmailWarningCode ) {
		case EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL:
			return (
				<EmailNonOwnerMessage
					domainName={ domain.name }
					selectedSite={ selectedSite }
					source="email-management"
				/>
			);
		case EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION:
			return (
				<EmailNonDomainOwnerMessage
					domain={ domain }
					source="email-management"
					usePromoCard={ false }
					selectedSite={ selectedSite }
				/>
			);
		default:
			if ( cannotAddEmailWarningMessage ) {
				return (
					<div className="email-plan-warning-notice__warning">
						<div className="email-plan-warning-notice__message">
							<span>{ cannotAddEmailWarningMessage }</span>
						</div>
					</div>
				);
			}
			return null;
	}
};

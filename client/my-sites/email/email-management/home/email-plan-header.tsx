import { CompactCard } from '@automattic/components';
import classnames from 'classnames';
import MaterialIcon from 'calypso/components/material-icon';
import EmailPlanSubscription from 'calypso/my-sites/email/email-management/home/email-plan-subscription';
import EmailPlanWarnings from 'calypso/my-sites/email/email-management/home/email-plan-warnings';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import { resolveEmailPlanStatus } from 'calypso/my-sites/email/email-management/home/utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';

type EmailPlanHeaderProps = {
	domain: ResponseDomain;
	emailAccount: EmailAccount;
	isLoadingEmails: boolean;
	hasEmailSubscription?: boolean;
	isLoadingPurchase: boolean;
	purchase?: Purchase;
	selectedSite?: SiteDetails;
};

const EmailPlanHeader = ( {
	domain,
	emailAccount,
	hasEmailSubscription,
	isLoadingEmails,
	isLoadingPurchase,
	purchase,
	selectedSite,
}: EmailPlanHeaderProps ) => {
	if ( ! domain ) {
		return null;
	}

	const { statusClass, text, icon } = resolveEmailPlanStatus(
		domain,
		emailAccount,
		isLoadingEmails
	);

	const cardClasses = classnames( 'email-plan-header', statusClass );

	return (
		<>
			<CompactCard className={ cardClasses }>
				<span className="email-plan-header__icon">
					<EmailTypeIcon domain={ domain } />
				</span>

				<div>
					<h2>{ domain.name }</h2>

					<span className="email-plan-header__status">
						<MaterialIcon icon={ icon } /> { text }
					</span>
				</div>

				{ hasEmailSubscription && emailAccount && (
					<EmailPlanWarnings domain={ domain } emailAccount={ emailAccount } />
				) }
			</CompactCard>

			{ hasEmailSubscription && (
				<EmailPlanSubscription
					purchase={ purchase }
					domain={ domain }
					selectedSite={ selectedSite }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			) }
		</>
	);
};

export default EmailPlanHeader;

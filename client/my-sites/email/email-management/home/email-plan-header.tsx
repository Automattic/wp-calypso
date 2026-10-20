import { CompactCard, MaterialIcon } from '@automattic/components';
import clsx from 'clsx';
import { EmailPlanSubscription } from 'calypso/my-sites/email/email-management/home/email-plan-subscription';
import EmailPlanWarnings from 'calypso/my-sites/email/email-management/home/email-plan-warnings';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import { useEmailPurchaseByDomain } from 'calypso/my-sites/email/email-management/home/use-email-purchase';
import { resolveEmailPlanStatus } from 'calypso/my-sites/email/email-management/home/utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { EmailAccount } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type EmailPlanHeaderProps = {
	domain: ResponseDomain;
	emailAccount: EmailAccount;
	isLoadingEmails: boolean;
	hasEmailSubscription: boolean;
	selectedSite: SiteDetails;
};

export const EmailPlanHeader = ( {
	domain,
	emailAccount,
	hasEmailSubscription,
	isLoadingEmails,
	selectedSite,
}: EmailPlanHeaderProps ) => {
	const { purchase, isLoadingPurchase } = useEmailPurchaseByDomain( domain );

	if ( ! domain ) {
		return null;
	}

	const { statusClass, text, icon } = resolveEmailPlanStatus(
		domain,
		emailAccount,
		isLoadingEmails
	);

	const cardClasses = clsx( 'email-plan-header', statusClass );

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

				{ ! isLoadingEmails && hasEmailSubscription && emailAccount && (
					<EmailPlanWarnings domain={ domain } emailAccount={ emailAccount } />
				) }
			</CompactCard>

			{ hasEmailSubscription && (
				<EmailPlanSubscription
					purchase={ purchase }
					selectedSite={ selectedSite }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			) }
		</>
	);
};

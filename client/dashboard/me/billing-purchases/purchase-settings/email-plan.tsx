import { EmailProvider } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { currencyDollar, envelope } from '@wordpress/icons';
import { useAnalytics } from '../../../app/analytics';
import { addMailboxRoute, chooseEmailSolutionRoute } from '../../../app/router/emails';
import { ActionList } from '../../../components/action-list';
import OverviewCard from '../../../components/overview-card';
import { IntervalLength, MailboxProvider, TitanPlanTier } from '../../../emails/types';
import { isMonthlyEmailProduct } from '../../../emails/utils/is-monthly-email-product';
import { getTitanTierFromSlug } from '../../../emails/utils/titan-tiers';
import { isTitanMail } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Whether the Titan-tier email plan management UI (tier upgrade, add mailboxes,
 * redesigned overview cards) should be shown for this purchase. Gated behind the
 * same flag as the MSD plan-selection grid it links to (DOTEMP-111), since the
 * upgrade path is meaningless without that grid.
 */
export function isEmailPlanManagementEnabled( purchase: Purchase ): boolean {
	return config.isEnabled( 'emails/titan-tiers' ) && isTitanMail( purchase );
}

function getEmailPlanInterval( purchase: Purchase ): IntervalLength {
	return isMonthlyEmailProduct( purchase ) ? IntervalLength.Monthly : IntervalLength.Annually;
}

/**
 * The per-mailbox renewal price in the smallest currency unit. Titan is billed
 * per mailbox, so the stored price is the term total across all mailboxes.
 */
function getPerMailboxPriceInteger( purchase: Purchase ): number {
	const quantity = purchase.renewal_price_tier_usage_quantity || 1;
	return Math.round( purchase.price_integer / quantity );
}

function useEmailUpgradeNavigation( purchase: Purchase ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	return () => {
		recordTracksEvent( 'calypso_purchases_email_upgrade_plan_click', {
			product_slug: purchase.product_slug,
		} );
		navigate( {
			to: chooseEmailSolutionRoute.to,
			params: { domain: purchase.meta ?? '' },
			search: { intent: 'upgrade' },
		} );
	};
}

function useAddMailboxesNavigation( purchase: Purchase ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	return () => {
		const tier = getTitanTierFromSlug( purchase.product_slug );
		recordTracksEvent( 'calypso_purchases_email_add_mailboxes_click', {
			product_slug: purchase.product_slug,
		} );
		navigate( {
			to: addMailboxRoute.to,
			params: {
				domain: purchase.meta ?? '',
				provider: MailboxProvider.Titan,
				interval: getEmailPlanInterval( purchase ),
			},
			// Omit the default tier so existing Pro URLs stay unchanged.
			search: { tier: tier === TitanPlanTier.Pro ? undefined : tier },
		} );
	};
}

/**
 * Primary "Upgrade plan" button shown next to the product title in the page header.
 */
export function EmailUpgradePlanButton( { purchase }: { purchase: Purchase } ) {
	const onUpgrade = useEmailUpgradeNavigation( purchase );

	return (
		<Button __next40pxDefaultSize variant="primary" onClick={ onUpgrade }>
			{ __( 'Upgrade plan' ) }
		</Button>
	);
}

export function EmailUpgradePlanActionItem( { purchase }: { purchase: Purchase } ) {
	const onUpgrade = useEmailUpgradeNavigation( purchase );

	return (
		<ActionList.ActionItem
			title={ __( 'Upgrade plan' ) }
			description={ __( 'Find the best fit for your business.' ) }
			actions={
				<Button variant="secondary" size="compact" onClick={ onUpgrade }>
					{ __( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
}

export function AddMailboxesActionItem( { purchase }: { purchase: Purchase } ) {
	const onAdd = useAddMailboxesNavigation( purchase );
	const perMailbox = formatCurrency(
		getPerMailboxPriceInteger( purchase ),
		purchase.currency_code,
		{
			isSmallestUnit: true,
			stripZeros: true,
		}
	);
	const description = isMonthlyEmailProduct( purchase )
		? /* translators: %s is a per-mailbox monthly price, e.g. "$3.50". */
		  sprintf( __( 'Need more? Starts at %s/month/mailbox' ), perMailbox )
		: /* translators: %s is a per-mailbox yearly price, e.g. "$42". */
		  sprintf( __( 'Need more? Starts at %s/year/mailbox' ), perMailbox );

	return (
		<ActionList.ActionItem
			title={ __( 'Add new mailboxes' ) }
			description={ description }
			actions={
				<Button variant="secondary" size="compact" onClick={ onAdd }>
					{ __( 'Add' ) }
				</Button>
			}
		/>
	);
}

/**
 * Overview card showing the per-mailbox renewal price for an email plan.
 */
export function EmailPlanPriceCard( { purchase }: { purchase: Purchase } ) {
	return (
		<OverviewCard
			icon={ currencyDollar }
			title={ __( 'Renewal price' ) }
			heading={ formatCurrency( getPerMailboxPriceInteger( purchase ), purchase.currency_code, {
				isSmallestUnit: true,
			} ) }
			description={
				isMonthlyEmailProduct( purchase )
					? __( 'Per mailbox/month. Excludes taxes.' )
					: __( 'Per mailbox/year. Excludes taxes.' )
			}
		/>
	);
}

/**
 * Overview card summarizing the mailboxes covered by an email plan. Replaces the
 * generic "Owner" card for email purchases and links to the email management page.
 */
export function EmailPlanMailboxCard( { purchase }: { purchase: Purchase } ) {
	const { data: accounts, isLoading } = useQuery( {
		...mailboxAccountsQuery( purchase.blog_id, purchase.meta ?? '' ),
		enabled: Boolean( purchase.blog_id && purchase.meta ),
	} );

	const titanAccount = accounts?.find(
		( account ) => account.account_type === EmailProvider.Titan
	);
	const mailboxes = titanAccount?.emails?.filter( ( email ) => email.email_type === 'email' ) ?? [];
	const count = mailboxes.length || purchase.renewal_price_tier_usage_quantity || 0;
	const firstMailbox = mailboxes[ 0 ];

	const heading =
		count === 1 && firstMailbox
			? `${ firstMailbox.mailbox }@${ firstMailbox.domain }`
			: sprintf(
					// translators: %d is a number of mailboxes.
					_n( '%d mailbox', '%d mailboxes', count ),
					count
			  );

	return (
		<OverviewCard
			icon={ envelope }
			title={ _n( 'Mailbox', 'Mailboxes', count ) }
			heading={ heading }
			description={ count === 1 && firstMailbox ? undefined : purchase.meta ?? undefined }
			link="/emails"
			isLoading={ isLoading }
		/>
	);
}

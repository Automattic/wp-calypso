import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isWpComPlan,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { isRefundable } from 'calypso/lib/purchases';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PlansIntent } from '@automattic/plans-grid-next';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { UpgradeCreditsNoticeSource } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';

type UpgradeCreditsNoticeTextProps = {
	variant: 'compact' | 'full';
	amountInCurrency: string;
	source?: UpgradeCreditsNoticeSource | null;
};

const UpgradeCreditsNoticeText = ( {
	variant,
	amountInCurrency,
	source,
}: UpgradeCreditsNoticeTextProps ) => {
	const translate = useTranslate();

	if ( variant === 'compact' ) {
		return translate( 'You have %(amountInCurrency)s in upgrade credits available', {
			args: { amountInCurrency },
		} );
	}

	const supportLink = (
		<InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />
	);

	switch ( source ) {
		case 'plan':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current plan. This credit will be applied to the pricing below at checkout if you upgrade today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'domain-and-other-upgrades':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain and other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'domain':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'other-upgrades':
		default:
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
	}
};

function hasOtherUpgradesPurchase( sitePurchases: Purchase[] | undefined ): boolean {
	return (
		sitePurchases?.some( ( purchase ) => {
			const productSlug = purchase?.productSlug;
			if ( ! productSlug ) {
				return false;
			}

			// "Other upgrades" means non-domain and non-plan purchases (e.g. themes add-on, storage, etc).
			if ( isWpComPlan( productSlug ) ) {
				return false;
			}
			if (
				isDomainRegistration( purchase ) ||
				isDomainTransfer( purchase ) ||
				isDomainMapping( purchase )
			) {
				return false;
			}

			return true;
		} ) ?? false
	);
}

type Props = {
	className?: string;
	onDismissClick?: () => void;
	siteId: number;
	visiblePlans?: PlanSlug[];
	intent?: PlansIntent;
};

const PlanNoticeUpgradeCredit = ( {
	className,
	onDismissClick,
	siteId,
	visiblePlans,
	intent,
}: Props ) => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const upgradeCreditsNoticeData = useUpgradeCreditsNoticeData( siteId, visiblePlans || [] );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	// For plans-switch intent, look up the current purchase's refund options.
	const purchaseIdParam =
		typeof window !== 'undefined'
			? new URLSearchParams( window.location.search ).get( 'purchaseId' )
			: null;
	const purchaseIdNum = purchaseIdParam ? parseInt( purchaseIdParam, 10 ) : 0;
	const currentPurchase = useSelector( ( state ) =>
		purchaseIdNum ? getByPurchaseId( state, purchaseIdNum ) : undefined
	) as Purchase | undefined;
	const maxRefundAmount = useMemo( () => {
		if (
			intent !== 'plans-switch' ||
			! currentPurchase ||
			! isRefundable( currentPurchase ) ||
			! Array.isArray( currentPurchase.refundOptions )
		) {
			return null;
		}
		const amounts = currentPurchase.refundOptions
			.map( ( opt ) => opt.refund_amount )
			.filter( ( amount ) => amount > 0 );
		if ( ! amounts.length ) {
			return null;
		}
		return {
			amount: Math.max( ...amounts ),
			currencyCode: currentPurchase.currencyCode,
		};
	}, [ intent, currentPurchase ] );

	const credits = upgradeCreditsNoticeData?.credits ?? 0;

	// Check if this is the plans-upgrade flow which requires compact styling.
	const isUpgradeFlow = intent === 'plans-upgrade';
	const isSwitchPlan = intent === 'plans-switch';

	// For plans-switch with a refundable purchase, show refund notice instead.
	if ( isSwitchPlan && maxRefundAmount ) {
		const formattedAmount = formatCurrency( maxRefundAmount.amount, maxRefundAmount.currencyCode );
		return (
			<>
				<QueryUserPurchases />
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					{ translate(
						'You\u2019re eligible for a refund of up to %(amount)s if you switch to a lower plan. The refund will be processed to your original payment method.',
						{ args: { amount: formattedAmount } }
					) }
				</Notice>
			</>
		);
	}

	const showNotice = credits > 0;

	if ( ! showNotice ) {
		// Render the query component for plans-switch so purchase data loads for
		// future re-renders when the data arrives.
		if ( isSwitchPlan ) {
			return <QueryUserPurchases />;
		}
		return null;
	}

	const amountInCurrency = formatCurrency( credits, currencyCode ?? '', {
		isSmallestUnit: true,
		stripZeros: isUpgradeFlow,
	} );

	const effectiveSource =
		upgradeCreditsNoticeData?.source === 'domain' && hasOtherUpgradesPurchase( sitePurchases )
			? 'domain-and-other-upgrades'
			: upgradeCreditsNoticeData?.source;
	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			{ isSwitchPlan && <QueryUserPurchases /> }
			{ isUpgradeFlow ? (
				<div className="plan-upgrade-credit-notice-compact">
					<UpgradeCreditsNoticeText variant="compact" amountInCurrency={ amountInCurrency } />
				</div>
			) : (
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					<UpgradeCreditsNoticeText
						variant="full"
						source={ effectiveSource }
						amountInCurrency={ amountInCurrency }
					/>
				</Notice>
			) }
		</>
	);
};

export default PlanNoticeUpgradeCredit;

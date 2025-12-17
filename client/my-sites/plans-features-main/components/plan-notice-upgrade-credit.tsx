import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isWpComPlan,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Notice from 'calypso/components/notice';
import UpgradeCreditsNoticeText from 'calypso/my-sites/plans-features-main/components/upgrade-credits-notice-text';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PlansIntent } from '@automattic/plans-grid-next';
import type { Purchase } from 'calypso/lib/purchases/types';

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
	/**
	 * Where this notice is rendered. Used to pick copy that matches the surrounding UI.
	 */
	context?: 'plans' | 'overview';
	siteId: number;
	visiblePlans?: PlanSlug[];
	intent?: PlansIntent;
};

const PlanNoticeUpgradeCredit = ( {
	className,
	onDismissClick,
	context = 'plans',
	siteId,
	visiblePlans,
	intent,
}: Props ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const upgradeCreditsNoticeData = useUpgradeCreditsNoticeData( siteId, visiblePlans || [] );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const credits = upgradeCreditsNoticeData?.credits ?? 0;
	const showNotice = credits > 0;

	// Check if this is the plans-upgrade flow which requires compact styling.
	const isUpgradeFlow = intent === 'plans-upgrade';

	if ( ! showNotice ) {
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
			{ isUpgradeFlow ? (
				<div className="plan-upgrade-credit-notice-compact">
					<UpgradeCreditsNoticeText
						context={ context }
						variant="compact"
						amountInCurrency={ amountInCurrency }
					/>
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
						context={ context }
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

import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isWpComPlan,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { Notice } from '@wordpress/components';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import UpgradeCreditsNoticeText from 'calypso/my-sites/plans-features-main/components/upgrade-credits-notice-text';
import { useUpgradeCreditsNoticeData } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCreditNotice = () => {
	const site = useSelector( getSelectedSite );
	const { ID: siteId } = site || {};
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const upgradeCreditsNoticeData = useUpgradeCreditsNoticeData( siteId );

	if ( ! siteId ) {
		return null;
	}

	const credits = upgradeCreditsNoticeData?.credits ?? 0;
	const showNotice = credits > 0;

	const hasOtherUpgradesPurchase =
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
		} ) ?? false;

	const effectiveSource =
		upgradeCreditsNoticeData?.source === 'domain' && hasOtherUpgradesPurchase
			? 'domain-and-other-upgrades'
			: upgradeCreditsNoticeData?.source;

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			{ showNotice && (
				<Notice
					className="hosting-overview__domain-to-plan-credit-notice"
					isDismissible={ false }
					status="info"
					onRemove={ () => {} }
				>
					<UpgradeCreditsNoticeText
						context="overview"
						variant="full"
						source={ effectiveSource }
						amountInCurrency={ formatCurrency( credits, currencyCode ?? '', {
							isSmallestUnit: true,
						} ) }
					/>
				</Notice>
			) }
		</>
	);
};

export default PlanCreditNotice;

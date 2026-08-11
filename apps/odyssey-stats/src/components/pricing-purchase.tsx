import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import StatsMain from 'calypso/my-sites/stats/components/stats-main';
import { PRICING_GRID_REFERRER } from 'calypso/my-sites/stats/pricing-grid/hooks/use-dismiss-pricing-grid';
import { StatsSingleItemPagePurchaseFrame } from 'calypso/my-sites/stats/stats-purchase/stats-purchase-shared';
import { StatsCommercialPurchase } from 'calypso/my-sites/stats/stats-purchase/stats-purchase-single-item';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import config from '../lib/config-api';

/**
 * The views-tier step of the pre-connection pricing screen.
 *
 * Renders the same commercial pitch, slider and copy as the site-scoped purchase page, so the
 * two never drift. Only the two things a site without a connection cannot do are replaced: the
 * checkout is siteless (`StatsCommercialPurchase` derives that from the connection status it
 * already reads), and "I will do it later" starts the connection instead of returning to a
 * dashboard that does not exist yet.
 * @param props                   - Component props.
 * @param props.onPostpone        - Runs when the visitor declines the paid plan.
 * @param props.onBeforeCheckout  - Runs immediately before leaving for checkout.
 */
export default function PricingPurchase( {
	onPostpone,
	onBeforeCheckout,
}: {
	onPostpone: () => void;
	onBeforeCheckout: () => void;
} ) {
	const product = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	);

	return (
		<StatsMain fullWidthLayout>
			{ /*
			 * `stats-purchase-page` is the scope the purchase stylesheet defines its Jetpack
			 * design tokens on, so the frame's own rules resolve only inside it. The real
			 * purchase route applies the same pair of classes.
			 */ }
			<div className="stats stats-purchase-page">
				<StatsSingleItemPagePurchaseFrame>
					<StatsCommercialPurchase
						siteId={ null }
						siteSlug={ config( 'site_suffix' ) }
						planValue={ 0 }
						currencyCode={ product?.currency_code ?? 'USD' }
						adminUrl={ config( 'admin_url' ) }
						redirectUri="admin.php?page=stats"
						from={ PRICING_GRID_REFERRER }
						onPostpone={ onPostpone }
						onBeforeCheckout={ onBeforeCheckout }
					/>
				</StatsSingleItemPagePurchaseFrame>
			</div>
		</StatsMain>
	);
}

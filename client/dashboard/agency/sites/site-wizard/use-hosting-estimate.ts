import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	getPressablePlanInfo,
	isPressableAddonProduct,
} from '../../marketplace/hosting/lib/pressable-plans';
import { getPressableProducts } from '../../marketplace/hosting/lib/pressable-products';
import { getWpcomPlan } from '../../marketplace/lib/wpcom-hosting';
import { getWpcomTieredPrice } from '../../marketplace/products/lib/product-pricing';
import type { Host } from './use-site-wizard';

export interface HostingEstimate {
	/** Monthly total for the whole batch, formatted. */
	total: string;
	/** WordPress.com: the price each site pays after any volume discount. */
	perSite?: string;
	/** WordPress.com: whether a volume discount brought the per-site price down. */
	discounted?: boolean;
	/** Pressable: the plan that fits, without the brand prefix. */
	plan?: string;
	/** Pressable: how many sites that plan holds. */
	capacity?: number;
}

const money = ( amount: number, currency: string ) =>
	formatCurrency( amount, currency, { stripZeros: true } );

/**
 * A monthly estimate for hosting `count` sites with each provider, from the
 * same prices and volume tiers the Marketplace uses. WordPress.com charges per
 * site; Pressable sells plans by how many sites they hold, so the estimate is
 * the cheapest plan that fits.
 */
export function useHostingEstimates( count: number ): {
	isLoading: boolean;
	estimates: Partial< Record< Host, HostingEstimate > >;
} {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: products, isLoading } = useQuery( {
		...agencyProductsQuery( agency?.id ?? 0 ),
		enabled: !! agency?.id,
	} );
	const estimates: Partial< Record< Host, HostingEstimate > > = {};
	if ( ! products ) {
		return { isLoading, estimates };
	}
	const sites = Math.max( 1, count );

	const wpcomPlan = getWpcomPlan( products );
	if ( wpcomPlan?.monthly_price ) {
		const pricing = getWpcomTieredPrice( wpcomPlan, sites, 'monthly' );
		estimates.wpcom = {
			total: money( pricing.discountedCost, wpcomPlan.currency ),
			perSite: money( pricing.pricePerUnit, wpcomPlan.currency ),
			discounted: pricing.pricePerUnit < pricing.basePricePerUnit,
		};
	}

	const pressablePlan = getPressableProducts( products )
		.filter( ( product ) => ! isPressableAddonProduct( product.slug ) )
		.map( ( product ) => ( { product, info: getPressablePlanInfo( product ) } ) )
		.filter(
			( { product, info } ) =>
				info && info.install >= sites && ( product.monthly_price || product.yearly_price )
		)
		.map( ( { product, info } ) => ( {
			product,
			capacity: info?.install ?? sites,
			monthly: product.monthly_price ?? ( product.yearly_price ?? 0 ) / 12,
		} ) )
		.sort( ( a, b ) => a.monthly - b.monthly )[ 0 ];
	if ( pressablePlan ) {
		estimates.pressable = {
			total: money( pressablePlan.monthly, pressablePlan.product.currency ),
			plan: pressablePlan.product.name.replace( /^Pressable\s+/i, '' ),
			capacity: pressablePlan.capacity,
		};
	}
	return { isLoading, estimates };
}

/**
 * External dependencies
 */
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

// API interfaces.
interface APIBillingCounts {
	assigned: number;
	unassigned: number;
	total: number;
}

interface APIBillingCosts {
	total: number;
	assigned: number;
	unassigned: number;
}

interface APIBillingProduct {
	product_slug: string;
	product_name: string;
	product_cost: number;
	product_total_cost: number;
	counts: APIBillingCounts;
}

interface APIBilling {
	date: string;
	products: APIBillingProduct[];
	licenses: APIBillingCounts;
	costs: APIBillingCosts;
}

// Calypso interfaces.
interface BillingCounts {
	assigned: number;
	unassigned: number;
	total: number;
}

interface BillingCosts {
	total: number;
	assigned: number;
	unassigned: number;
}

interface BillingProduct {
	productSlug: string;
	productName: string;
	productCost: number;
	productTotalCost: number;
	counts: BillingCounts;
}

interface Billing {
	date: string;
	products: BillingProduct[];
	licenses: BillingCounts;
	costs: BillingCosts;
}

function queryBillingDashboard(): Promise< APIBilling > {
	return wpcomJpl.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/licenses/billing',
	} );
}

function selectBillingDashboard( api: APIBilling ): Billing {
	return {
		date: api.date,
		products: api.products.map(
			( product ): BillingProduct => ( {
				productSlug: product.product_slug,
				productName: product.product_name,
				productCost: product.product_cost,
				productTotalCost: product.product_total_cost,
				counts: product.counts,
			} )
		),
		licenses: api.licenses,
		costs: api.costs,
	};
}

export default function useBillingDashboardQuery< TError = unknown >(
	options?: UseQueryOptions< APIBilling, TError, Billing >
): UseQueryResult< Billing, TError > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	return useQuery< APIBilling, TError, Billing >(
		[ 'partner-portal', 'billing-dashboard', activeKeyId ],
		queryBillingDashboard,
		{
			select: selectBillingDashboard,
			onError: () => {
				dispatch(
					errorNotice( translate( 'We were unable to retrieve your billing details.' ), {
						id: 'partner-portal-billing-dashboard-failure',
					} )
				);
			},
			...options,
		}
	);
}

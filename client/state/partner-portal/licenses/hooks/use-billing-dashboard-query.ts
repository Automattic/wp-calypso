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
import { errorNotice, plainNotice } from 'calypso/state/notices/actions';

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
			onError: ( error ) => {
				// We wish to handle the "no billing invoice available" response differently
				// from hard errors. We want this because the response itself did not encounter
				// any errors but the upcoming invoice has not been created yet.
				if ( error.hasOwnProperty( 'code' ) && 'no_billing_invoice_available' === error.code ) {
					dispatch(
						plainNotice(
							translate( 'Your upcoming invoice is being prepared and will be available soon.' ),
							{
								id: 'partner-portal-billing-dashboard-no-billing-invoice-available',
							}
						)
					);

					return;
				}

				dispatch(
					errorNotice( translate( 'We were unable to retrieve your billing details.' ), {
						id: 'partner-portal-billing-dashboard-failure',
					} )
				);
			},
			retry: ( failureCount, error ) => {
				// There is no reason for us to try and re-fetch on the "no billing
				// invoice available" error because it is an expected behaviour which
				// is only going to change when Jetpack prepares an invoice and is
				// therefore not necessarily a temporary error and might take hours
				// or even days before changing to either success or another error.
				if ( error.hasOwnProperty( 'code' ) && 'no_billing_invoice_available' === error.code ) {
					return false;
				}

				// We have to define a fallback amount of failures because we
				// override the retry option with a function.
				// We use 3 as the failureCount since its the default value for
				// react-query that we used before.
				// @link https://react-query.tanstack.com/guides/query-retries
				return 3 > failureCount;
			},
			...options,
		}
	);
}

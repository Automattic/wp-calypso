import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	product_quantity: number;
	product_cost: number;
	product_total_cost: number;
	counts: APIBillingCounts;
}

interface APIBilling {
	date: string;
	products: APIBillingProduct[];
	licenses: APIBillingCounts;
	costs: APIBillingCosts;
	price_interval: string;
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
	productQuantity: number;
	productCost: number;
	productTotalCost: number;
	counts: BillingCounts;
}

interface Billing {
	date: string;
	products: BillingProduct[];
	licenses: BillingCounts;
	costs: BillingCosts;
	priceInterval: string;
}

interface BillingDashboardQueryError {
	code?: string;
}

function selectBillingSummary( api: APIBilling ): Billing {
	return {
		date: api.date,
		products: api.products.map(
			( product ): BillingProduct => ( {
				productSlug: product.product_slug,
				productName: product.product_name,
				productQuantity: product.product_quantity,
				productCost: product.product_cost,
				productTotalCost: product.product_total_cost,
				counts: product.counts,
			} )
		),
		licenses: api.licenses,
		costs: api.costs,
		priceInterval: api.price_interval,
	};
}

export default function useFetchBillingSummary(
	options?: UseQueryOptions< APIBilling, BillingDashboardQueryError, Billing >
): UseQueryResult< Billing, BillingDashboardQueryError > {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agencyId = useSelector( getActiveAgencyId );

	const query = useQuery( {
		queryKey: [ 'a4a-purchases', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: addQueryArgs( { agency_id: agencyId }, '/jetpack-licensing/licenses/billing' ),
			} ),
		select: selectBillingSummary,
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
		enabled: !! agencyId,
		...options,
	} );

	const { isError, error } = query;

	useEffect( () => {
		if ( isError ) {
			// We wish to handle the "no billing invoice available" response differently
			// from hard errors. We want this because the response itself did not encounter
			// any errors but the upcoming invoice has not been created yet.
			if ( error.hasOwnProperty( 'code' ) && 'no_billing_invoice_available' === error.code ) {
				dispatch(
					plainNotice(
						translate( 'Your upcoming invoice is being prepared and will be available soon.' ),
						{
							id: 'a4a-billing-dashboard-no-billing-invoice-available',
						}
					)
				);

				return;
			}

			dispatch(
				errorNotice( translate( 'We were unable to retrieve your billing details.' ), {
					id: 'a4a-billing-dashboard-failure',
				} )
			);
		}
	}, [ dispatch, translate, isError, error ] );

	return query;
}

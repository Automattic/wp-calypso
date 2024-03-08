import config from '@automattic/calypso-config';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
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

function getBillingSummary(): Promise< APIBilling > {
	const showDummyData = config.isEnabled( 'a4a/mock-api-data' );

	if ( showDummyData ) {
		return Promise.resolve( {
			products: [
				{
					product_slug: 'jetpack-backup-t1',
					product_name: 'Licenses: Jetpack VaultPress Backup (10GB)',
					product_quantity: 155,
					product_cost: 0.16,
					product_total_cost: 24.8,
					counts: {
						assigned: 2,
						unassigned: 3,
						total: 5,
					},
				},
				{
					product_slug: 'jetpack-search',
					product_name: 'Licenses: Jetpack Search',
					product_quantity: 31,
					product_cost: 0.27,
					product_total_cost: 8.37,
					counts: {
						assigned: 0,
						unassigned: 1,
						total: 1,
					},
				},
				{
					product_slug: 'jetpack-ai',
					product_name: 'Licenses: Jetpack AI Assistant',
					product_quantity: 372,
					product_cost: 0.27,
					product_total_cost: 100.44,
					counts: {
						assigned: 1,
						unassigned: 11,
						total: 12,
					},
				},
			],
			licenses: {
				total: 18,
				assigned: 3,
				unassigned: 15,
			},
			costs: {
				total: 4.31,
				assigned: 0.59,
				unassigned: 3.72,
			},
			price_interval: 'day',
			date: new Date().toString(),
		} );
	}

	return Promise.reject( {
		code: 'rest_forbidden',
		data: { status: 403 },
		status: 403,
		statusCode: 403,
	} );
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
	const activeKeyId = null; // FIXME: get from actual store.

	const query = useQuery( {
		queryKey: [ 'a4a-purchases', activeKeyId ],
		queryFn: getBillingSummary,
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

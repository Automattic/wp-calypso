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
					product_slug: 'jetpack-social-basic',
					product_name: 'Licenses: Jetpack Social Basic',
					product_quantity: 31,
					product_cost: 0.16,
					product_total_cost: 4.96,
					counts: {
						assigned: 0,
						unassigned: 1,
						total: 1,
					},
				},
				{
					product_slug: 'jetpack-scan',
					product_name: 'Licenses: Jetpack Scan Daily',
					product_quantity: 93,
					product_cost: 0.16,
					product_total_cost: 14.88,
					counts: {
						assigned: 1,
						unassigned: 2,
						total: 3,
					},
				},
				{
					product_slug: 'jetpack-boost',
					product_name: 'Licenses: Jetpack Boost',
					product_quantity: 155,
					product_cost: 0.32,
					product_total_cost: 49.6,
					counts: {
						assigned: 2,
						unassigned: 3,
						total: 5,
					},
				},
				{
					product_slug: 'jetpack-security-t1',
					product_name: 'Licenses: Jetpack Security (10GB)',
					product_quantity: 527,
					product_cost: 0.32,
					product_total_cost: 168.64,
					counts: {
						assigned: 0,
						unassigned: 17,
						total: 17,
					},
				},
				{
					product_slug: 'jetpack-complete',
					product_name: 'Licenses: Jetpack Complete',
					product_quantity: 155,
					product_cost: 0.82,
					product_total_cost: 127.1,
					counts: {
						assigned: 1,
						unassigned: 4,
						total: 5,
					},
				},
				{
					product_slug: 'jetpack-anti-spam',
					product_name: 'Licenses: Jetpack Akismet Anti-spam',
					product_quantity: 124,
					product_cost: 0.16,
					product_total_cost: 19.84,
					counts: {
						assigned: 0,
						unassigned: 4,
						total: 4,
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
					product_slug: 'jetpack-backup-t2',
					product_name: 'Licenses: Jetpack VaultPress Backup (1TB)',
					product_quantity: 31,
					product_cost: 0.49,
					product_total_cost: 15.19,
					counts: {
						assigned: 0,
						unassigned: 1,
						total: 1,
					},
				},
				{
					product_slug: 'jetpack-ai',
					product_name: 'Licenses: Jetpack AI Assistant',
					product_quantity: 155,
					product_cost: 0.27,
					product_total_cost: 41.85,
					counts: {
						assigned: 0,
						unassigned: 5,
						total: 5,
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
				{
					product_slug: 'jetpack-anti-spam',
					product_name: 'Bundles: Jetpack Akismet Anti-spam',
					product_quantity: 31,
					product_cost: 1.93,
					product_total_cost: 59.83,
					counts: {
						assigned: 1,
						unassigned: 0,
						total: 1,
					},
				},
				{
					product_slug: 'jetpack-anti-spam',
					product_name: 'Bundled Licenses: Jetpack Akismet Anti-spam',
					product_quantity: 620,
					product_cost: 0,
					product_total_cost: 0,
					counts: {
						assigned: 1,
						unassigned: 19,
						total: 20,
					},
				},
				{
					product_slug: 'jetpack-security-t1',
					product_name: 'Bundles: Jetpack Security (10GB)',
					product_quantity: 93,
					product_cost: 4.89,
					product_total_cost: 242.73,
					counts: {
						assigned: 3,
						unassigned: 0,
						total: 3,
					},
				},
				{
					product_slug: 'jetpack-security-t1',
					product_name: 'Bundled Licenses: Jetpack Security (10GB)',
					product_quantity: 1860,
					product_cost: 0,
					product_total_cost: 0,
					counts: {
						assigned: 0,
						unassigned: 60,
						total: 60,
					},
				},
				{
					product_slug: 'jetpack-monitor',
					product_name: 'Licenses: Jetpack Monitor',
					product_quantity: 124,
					product_cost: 0.04,
					product_total_cost: 4.96,
					counts: {
						assigned: 1,
						unassigned: 3,
						total: 4,
					},
				},
				{
					product_slug: 'wpcom-hosting-business',
					product_name: 'Licenses: WordPress.com Creator',
					product_quantity: 62,
					product_cost: 0.82,
					product_total_cost: 50.84,
					counts: {
						assigned: 2,
						unassigned: 0,
						total: 2,
					},
				},
			],
			licenses: {
				total: 149,
				assigned: 15,
				unassigned: 134,
			},
			costs: {
				total: 934.03,
				assigned: 423.15,
				unassigned: 510.88,
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

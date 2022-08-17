import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UseMutationResult, useQuery, UseQueryOptions } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
	alphabeticallySortedProductOptions,
	ensurePartnerPortalReturnUrl,
	getProductTitle,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useIssueLicenseMutation, {
	MutationIssueLicenseVariables,
} from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIError, APILicense } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';

/**
 * Redirect to the partner portal or a present "return" GET parameter given a certain condition.
 *
 * @param {boolean} redirect Whether to execute the redirect.
 * @returns {void}
 */
export function useReturnUrl( redirect: boolean ): void {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			// Avoids redirect attempt if there is no `return` parameter
			if ( ! returnQuery ) {
				return;
			}

			page.redirect( returnUrl );
		}
	}, [ redirect ] );
}

/**
 * Returns the recent payment methods from the Jetpack Stripe account.
 *
 */
export function useRecentPaymentMethodsQuery( { enabled = true }: UseQueryOptions = {} ) {
	return useQuery(
		[ 'jetpack-cloud', 'partner-portal', 'recent-cards' ],
		() =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/stripe/payment-methods',
			} ),
		{
			enabled: enabled,
		}
	);
}

/**
 * Returns false; if flag ever becomes true, then returns true from then onwards.
 *
 * Useful to determine if pagination should be shown based on whether flag is or has been true at some point.
 * For example, Stripe responses include a boolean `has_more` pagination value which you can pass as the
 * argument and use the return value to conditionally render your pagination.
 *
 * @param {boolean} flag
 * @returns {boolean}
 */
export function usePermanentFlag( flag: boolean ): boolean {
	const [ wasTrue, setWasTrue ] = useState( false );

	useEffect( () => {
		if ( flag ) {
			setWasTrue( true );
		}
	}, [ flag ] );

	return wasTrue;
}

/**
 * Handle cursor-based pagination.
 *
 * @todo use this in payment method pagination.
 */
export function useCursorPagination(
	enabled: boolean,
	hasMore: boolean,
	onNavigateCallback: ( page: number, direction: 'next' | 'prev' ) => void
): [ number, boolean, ( page: number ) => void ] {
	const [ page, setPage ] = useState( 1 );
	const showPagination = usePermanentFlag( hasMore );
	const onNavigate = useCallback(
		( newPage: number ) => {
			const direction = newPage > page ? 'next' : 'prev';

			if ( ! enabled ) {
				return;
			}

			if ( newPage < 1 ) {
				return;
			}

			if ( direction === 'next' && ! hasMore ) {
				return;
			}

			setPage( newPage );
			onNavigateCallback?.( newPage, direction );
		},
		[ enabled, hasMore, setPage, onNavigateCallback ]
	);

	return [ page, showPagination, onNavigate ];
}

/**
 * Handle license issuing
 *
 */
export function useLicenseIssuing(
	selectedSite?: { ID: number; domain: string } | null,
	product?: string | null
): [
	UseMutationResult< APILicense, APIError, MutationIssueLicenseVariables, unknown >,
	boolean,
	() => void
] {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const sites = useSelector( getSites ).length;
	const products = useProductsQuery( {
		select: alphabeticallySortedProductOptions,
	} );

	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';

	const handleRedirectToDashboard = ( licenseKey: string ) => {
		const selectedProduct = products?.data?.find( ( p ) => p.slug === product );
		if ( selectedSite && selectedProduct ) {
			dispatch(
				setPurchasedLicense( {
					selectedSite: selectedSite?.domain,
					selectedProduct: {
						name: getProductTitle( selectedProduct.name ),
						key: licenseKey,
					},
				} )
			);
		}
		return page.redirect( '/dashboard' );
	};

	const requirePaymentMethod = useCallback( () => {
		if ( paymentMethodRequired ) {
			const nextStep = addQueryArgs(
				{
					product,
				},
				partnerPortalBasePath( '/payment-methods/add' )
			);
			page( nextStep );
		}
	}, [ product, paymentMethodRequired ] );

	const assignLicense = useAssignLicenseMutation( {
		onSuccess: ( license: any ) => {
			if ( fromDashboard ) {
				handleRedirectToDashboard( license.license_key );
				return;
			}

			page.redirect(
				addQueryArgs( { highlight: license.license_key }, partnerPortalBasePath( '/licenses' ) )
			);
		},
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message ) );
		},
	} );

	const issueLicense = useIssueLicenseMutation( {
		onSuccess: ( license ) => {
			const licenseKey = license.license_key;
			const selectedSiteId = selectedSite?.ID;

			if ( selectedSiteId ) {
				assignLicense.mutate( { licenseKey, selectedSite: selectedSiteId } );
				return;
			}

			let nextStep = addQueryArgs(
				{ highlight: license.license_key },
				partnerPortalBasePath( '/licenses' )
			);

			if ( sites > 0 ) {
				nextStep = addQueryArgs(
					{ key: license.license_key },
					partnerPortalBasePath( '/assign-license' )
				);
			}

			page.redirect( nextStep );
		},
		onError: ( error: APIError ) => {
			let errorMessage;

			switch ( error.code ) {
				case 'missing_valid_payment_method':
					errorMessage = translate(
						'A primary payment method is required.{{br/}} ' +
							'{{a}}Try adding a new payment method{{/a}} or contact support.',
						{
							components: {
								a: (
									<a
										href={
											'/partner-portal/payment-methods/add?return=/partner-portal/issue-license'
										}
									/>
								),
								br: <br />,
							},
						}
					);
					break;

				default:
					errorMessage = error.message;
					break;
			}

			dispatch( errorNotice( errorMessage ) );
		},
		retry: ( errorCount, error ) => {
			// If the user has just added their payment method it's likely that there's a slight delay before the API
			// is made aware of this and allows the creation of the license.
			// In order to make this a smoother experience for the user, we retry a couple of times silently if the
			// error is missing_valid_payment_method but our local state shows that the user has a payment method.
			if ( ! paymentMethodRequired && error?.code === 'missing_valid_payment_method' ) {
				return errorCount < 5;
			}

			return false;
		},
	} );

	const isSubmitting = useMemo(
		() => assignLicense.isLoading || issueLicense.isLoading,
		[ issueLicense, assignLicense ]
	);

	return [ issueLicense, isSubmitting, requirePaymentMethod ];
}

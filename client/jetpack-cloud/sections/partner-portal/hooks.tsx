import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
	selectAlphaticallySortedProductOptions,
	ensurePartnerPortalReturnUrl,
	getProductTitle,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIError } from 'calypso/state/partner-portal/types';
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
	product: string,
	selectedSite?: { ID: number; domain: string } | null
): [ () => void, boolean ] {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const sites = useSelector( getSites ).length;
	const products = useProductsQuery( {
		select: selectAlphaticallySortedProductOptions,
	} );

	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';

	const handleRedirectToDashboard = ( licenseKey: string ) => {
		const selectedProduct = products?.data?.find( ( p ) => p.slug === product );
		if ( selectedSite && selectedProduct ) {
			dispatch(
				setPurchasedLicense( {
					selectedSite: selectedSite?.domain,
					selectedProducts: [
						{
							name: getProductTitle( selectedProduct.name ),
							key: licenseKey,
							status: 'fulfilled',
						},
					],
				} )
			);
		}
		return page.redirect( '/dashboard' );
	};

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
			dispatch( recordTracksEvent( 'calypso_partner_portal_lincese_issued', { product } ) );

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

			dispatch(
				successNotice(
					translate( `Your %(product)s license was successfuly issued `, {
						args: {
							product:
								products.data?.find( ( productOption ) => productOption.slug === product )?.name ||
								'',
						},
					} ),
					{
						displayOnNextPage: true,
					}
				)
			);
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
									<a href="/partner-portal/payment-methods/add?return=/partner-portal/issue-license" />
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

	const isLoading = assignLicense.isLoading || issueLicense.isLoading;

	const issue = useCallback( () => {
		if ( isLoading ) {
			return;
		}

		dispatch( recordTracksEvent( 'calypso_partner_portal_issue_selection_submit', { product } ) );

		if ( paymentMethodRequired ) {
			const nextStep = addQueryArgs(
				{
					product,
				},
				partnerPortalBasePath( '/payment-methods/add' )
			);
			page( nextStep );
			return;
		}

		issueLicense.mutate( { product } );
	}, [ isLoading, product, paymentMethodRequired, issueLicense.mutate ] );

	return [ issue, isLoading ];
}

/**
 * Handle multiple license issue and assign
 *
 */
export function useIssueMultipleLicenses(
	selectedProducts: Array< string >,
	selectedSite?: { ID: number; domain: string } | null
): [ () => void, boolean ] {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const products = useProductsQuery( {
		select: selectAlphaticallySortedProductOptions,
	} );

	const sites = useSelector( getSites ).length;

	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';

	const assignLicense = useAssignLicenseMutation( {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );

	const issueLicense = useIssueLicenseMutation( {
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
									<a href="/partner-portal/payment-methods/add?return=/partner-portal/issue-license" />
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

	const isLoading = assignLicense.isLoading || issueLicense.isLoading;

	const issue = useCallback( async () => {
		if ( isLoading && ! selectedProducts.length ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_issue_mutiple_licenses_submit', {
				products: selectedProducts.join( ',' ),
			} )
		);

		const selectedSiteId = selectedSite?.ID;

		if ( paymentMethodRequired ) {
			const nextStep = addQueryArgs(
				{
					products: selectedProducts.join( ',' ),
					...( selectedSiteId && { site_id: selectedSiteId } ),
					...( fromDashboard && { source: 'dashboard' } ),
				},
				partnerPortalBasePath( '/payment-methods/add' )
			);
			page( nextStep );
			return;
		}

		const issueLicenseRequests: any[] = [];

		selectedProducts.forEach( ( product ) => {
			issueLicenseRequests.push( issueLicense.mutateAsync( { product } ) );
		} );
		const issueLicensePromises = await Promise.allSettled( issueLicenseRequests );

		if ( ! selectedSiteId ) {
			let nextStep = partnerPortalBasePath( '/licenses' );
			if ( sites > 0 ) {
				nextStep = addQueryArgs(
					{
						products: selectedProducts.join( ',' ),
					},
					partnerPortalBasePath( '/assign-license' )
				);
			}

			const assignedLicenses = selectedProducts
				.map(
					( product ) =>
						products.data?.find( ( productOption ) => productOption.slug === product )?.name
				)
				.filter( ( license ) => license );

			if ( assignedLicenses.length > 0 ) {
				const lastItem = assignedLicenses.slice( -1 )[ 0 ];
				const remainingItems = assignedLicenses.slice( 0, -1 );
				const messageArgs = {
					args: {
						lastItem: lastItem,
						remainingItems: remainingItems.join( ', ' ),
					},
					components: {
						strong: <strong />,
					},
				};

				dispatch(
					successNotice(
						// We are not using the same translate method for plural form since we have different arguments.
						assignedLicenses.length > 1
							? translate(
									'{{strong}}%(remainingItems)s and %(lastItem)s{{/strong}} were succesfully issued',
									messageArgs
							  )
							: translate(
									'{{strong}}%(lastItem)s{{/strong}} was succesfully issued',
									messageArgs
							  ),
						{
							displayOnNextPage: true,
						}
					)
				);
			}
			return page.redirect( nextStep );
		}

		const assignLicenseRequests: any = [];

		const assignedProducts: Array< any > = [];

		issueLicensePromises.forEach( ( promise: any ) => {
			const { status, value: license } = promise;
			if ( status === 'fulfilled' ) {
				const licenseKey = license.license_key;
				const productSlug = licenseKey.split( '_' )[ 0 ];
				const selectedProduct = products?.data?.find( ( p ) => p.slug === productSlug );
				if ( selectedProduct ) {
					assignedProducts.push( getProductTitle( selectedProduct.name ) );
				}
				if ( selectedSiteId ) {
					assignLicenseRequests.push(
						assignLicense.mutateAsync( { licenseKey, selectedSite: selectedSiteId } )
					);
				}
			}
		} );

		// Return if no request succeeded
		if ( ! assignedProducts.length ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_partner_portal_multiple_linceses_issued', {
				products: assignedProducts.join( ',' ),
			} )
		);

		const assignLicensePromises = await Promise.allSettled( assignLicenseRequests );

		const allSelectedProducts: { key: 'string'; name: string; status: 'rejected' | 'fulfilled' }[] =
			[];

		assignLicensePromises.forEach( ( promise: any ) => {
			const { status, value: license } = promise;
			if ( license ) {
				const licenseKey = license.license_key;
				const productSlug = licenseKey.split( '_' )[ 0 ];
				const selectedProduct = products?.data?.find( ( p ) => p.slug === productSlug );
				if ( selectedProduct ) {
					const item = {
						key: licenseKey,
						name: getProductTitle( selectedProduct.name ),
						status,
					};
					allSelectedProducts.push( item );
				}
			}
		} );
		const assignLicenseStatus = {
			selectedSite: selectedSite?.domain || '',
			selectedProducts: allSelectedProducts,
		};
		dispatch( resetSite() );
		dispatch( setPurchasedLicense( assignLicenseStatus ) );
		if ( fromDashboard ) {
			return page.redirect( '/dashboard' );
		}
	}, [
		isLoading,
		dispatch,
		selectedProducts,
		paymentMethodRequired,
		selectedSite,
		fromDashboard,
		issueLicense,
		sites,
		translate,
		products.data,
		assignLicense,
	] );

	return [ issue, isLoading ];
}

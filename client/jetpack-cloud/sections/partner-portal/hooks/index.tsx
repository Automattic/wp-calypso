import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ensurePartnerPortalReturnUrl,
	getProductTitle,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import getProductSlugFromLicenseKey from '../lib/get-product-slug-from-license-key';
import type { ProductInfo } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

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
	return useQuery( {
		queryKey: [ 'jetpack-cloud', 'partner-portal', 'recent-cards' ],
		queryFn: () =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/stripe/payment-methods',
			} ),
		enabled: enabled,
	} );
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

export function useAssignLicensesToSite( selectedSite: { ID: number; domain: string } | null ): {
	assignLicensesToSite: ( licenseKeys: string[] ) => void;
	isReady: boolean;
} {
	const products = useProductsQuery();
	const dispatch = useDispatch();
	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
	const assignLicense = useAssignLicenseMutation( {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );

	const isReady = assignLicense.isIdle;
	const assignLicensesToSite = useCallback(
		async ( licenseKeys: string[] ) => {
			// Only proceed if the mutation is in a fresh/ready state
			if ( ! assignLicense.isIdle ) {
				return;
			}

			// Only proceed if we have licenses to assign :-)
			if ( licenseKeys.length === 0 ) {
				return;
			}

			// We need a valid site ID in order to assign licenses to a site;
			// otherwise, we assign nothing
			const selectedSiteId = selectedSite?.ID;
			if ( ! selectedSiteId ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_assign_multiple_licenses_submit', {
					products: licenseKeys.join( ',' ),
					selected_site: selectedSiteId,
				} )
			);

			const keysWithProductNames = licenseKeys
				.map( ( key ) => {
					const productSlug = getProductSlugFromLicenseKey( key );
					const selectedProduct = products?.data?.find?.( ( p ) => p.slug === productSlug );

					return {
						key,
						product: selectedProduct,
					};
				} )
				// If we can't determine which product a license is meant for, filter it out
				.filter( ( { product } ) => Boolean( product ) )
				// We only need the product's title/display name
				.map( ( { key, product } ) => ( {
					key,
					name: getProductTitle( ( product as APIProductFamilyProduct ).name ),
				} ) );

			// Purposely catch any error responses and let them through,
			// so we can pass all their information along as ProductInfo objects
			// (not currently available via PromiseSettledResult<T>)
			const apiRequests = keysWithProductNames.map( ( { key, name } ) =>
				assignLicense
					.mutateAsync( { licenseKey: key, selectedSite: selectedSiteId } )
					.then( () => ( { key, name, status: 'fulfilled' } as ProductInfo ) )
					.catch( () => ( { key, name, status: 'rejected' } as ProductInfo ) )
			);

			const assignLicenseStatus = {
				selectedSite: selectedSite?.domain || '',
				selectedProducts: await Promise.all( apiRequests ),
			};

			dispatch( resetSite() );
			dispatch( setPurchasedLicense( assignLicenseStatus ) );

			if ( fromDashboard ) {
				return page.redirect( '/dashboard' );
			}

			return page.redirect( partnerPortalBasePath( '/licenses' ) );
		},
		[ dispatch, selectedSite, assignLicense, products, fromDashboard ]
	);

	return { assignLicensesToSite, isReady };
}

export { default as useIssueAndAssignLicenses } from './use-issue-and-assign-licenses';

/**
 * Returns product description and features with given product slug.
 *
 * @param productSlug
 * @returns
 */
export function useProductDescription( productSlug: string ): {
	description: TranslateResult | null;
	features: ReadonlyArray< TranslateResult >;
} {
	const translate = useTranslate();

	return useMemo( () => {
		let description = '';
		const features = [];

		switch ( productSlug ) {
			case 'jetpack-complete':
				description = translate( 'Includes all Security 1TB and full Jetpack package.' );
				features.push(
					translate( 'All Security products' ),
					translate( '1TB cloud storage' ),
					translate( 'Full Jetpack package' )
				);
				break;
			case 'jetpack-security-t1':
				description = translate(
					'Includes VaultPress Backup 10GB, Scan Daily and Akismet Anti-spam.'
				);
				features.push(
					translate( 'VaultPress Backup 10GB' ),
					translate( 'Scan Daily' ),
					translate( 'Akismet Anti-spam*' )
				);
				break;
			case 'jetpack-security-t2':
				description = translate(
					'Includes VaultPress Backup 1TB, Scan Daily and Akismet Anti-spam.'
				);
				features.push(
					translate( 'VaultPress Backup 1TB' ),
					translate( 'Scan Daily' ),
					translate( 'Akismet Anti-spam*' )
				);
				break;
			case 'jetpack-starter':
				description = translate( 'Includes VaultPress Backup 1GB and Akismet Anti-spam.' );
				features.push( translate( 'VaultPress Backup 1GB' ), translate( 'Akismet Anti-spam*' ) );
				break;
			case 'jetpack-anti-spam':
				description = translate( 'Automatically clear spam from your comments and forms.' );
				break;
			case 'jetpack-backup-t1':
			case 'jetpack-backup-t2':
				description = translate( 'Real-time cloud backups with one-click restores.' );
				break;
			case 'jetpack-boost':
				description = translate( 'Essential tools to speed up your site - no developer required.' );
				break;
			case 'jetpack-scan':
				description = translate( 'Automatic malware scanning with one-click fixes.' );
				break;
			case 'jetpack-videopress':
				description = translate( 'High-quality, ad-free video built specifically for WordPress.' );
				break;
			case 'jetpack-social-basic':
				description = translate( 'Write once, post everywhere.' );
				break;
			case 'jetpack-social-advanced':
				description = translate( 'Write once, post everywhere.' );
				break;
			case 'jetpack-search':
				description = translate( 'Help your site visitors find answers instantly.' );
				break;
			case 'jetpack-ai':
				description = translate( 'Unleash the power of AI to boost your content creation.' );
				break;
		}

		return {
			description,
			features,
		};
	}, [ productSlug, translate ] );
}

type Params = Array< { key: string; value: string } >;

export const useURLQueryParams = (): {
	getParamValue: ( paramKey: string ) => any;
	setParams: ( params: Params ) => void;
	resetParams: ( params: string[] ) => void;
} => {
	const pushState = useCallback( ( queryParams: { toString: () => string } ) => {
		const queryParamString = queryParams.toString();
		const newURL =
			window.location.origin +
			window.location.pathname +
			( queryParamString ? `?${ queryParamString }` : '' );
		window.history.pushState( {}, '', newURL );
	}, [] );

	const setParams = useCallback(
		( params: Params ) => {
			const queryParams = new URLSearchParams( window.location.search );
			params.forEach( ( param ) => {
				queryParams.set( param.key, param.value );
			} );
			pushState( queryParams );
		},
		[ pushState ]
	);

	const resetParams = useCallback(
		( params: string[] ) => {
			const queryParams = new URLSearchParams( window.location.search );
			params.forEach( ( param ) => {
				queryParams.delete( param );
			} );
			pushState( queryParams );
		},
		[ pushState ]
	);

	const getParamValue = useCallback( ( paramKey: string ) => {
		return getQueryArg( window.location.href, paramKey );
	}, [] );

	return {
		getParamValue,
		setParams,
		resetParams,
	};
};

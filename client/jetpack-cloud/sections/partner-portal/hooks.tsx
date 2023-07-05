import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { isEqual } from 'lodash';
import page from 'page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ensurePartnerPortalReturnUrl,
	getProductTitle,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
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

export function useAssignLicenses(
	licenseKeys: Array< string >,
	selectedSite: { ID: number; domain: string } | null
): [ () => void, boolean ] {
	const products = useProductsQuery();
	const dispatch = useDispatch();
	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
	const assignLicense = useAssignLicenseMutation( {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );
	const isLoading = assignLicense.isLoading;
	const selectedSiteId = selectedSite?.ID as number;
	const assignMultipleLicenses = useCallback( async () => {
		const assignLicenseRequests: any = [];
		licenseKeys.forEach( ( licenseKey ) => {
			assignLicenseRequests.push(
				assignLicense.mutateAsync( { licenseKey, selectedSite: selectedSiteId } )
			);
		} );

		dispatch(
			recordTracksEvent( 'calypso_partner_portal_assign_multiple_licenses_submit', {
				products: licenseKeys.join( ',' ),
				selected_site: selectedSiteId,
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
		return page.redirect( partnerPortalBasePath( '/licenses' ) );
	}, [
		dispatch,
		licenseKeys,
		selectedSite,
		assignLicense,
		products,
		fromDashboard,
		selectedSiteId,
	] );

	return [ assignMultipleLicenses, isLoading ];
}

/**
 * Handle multiple license issue and assign
 *
 */
export function useIssueMultipleLicenses(
	selectedProducts: Array< string >,
	selectedSite?: { ID: number; domain: string } | null,
	suggestedProducts: Array< string > = []
): [ () => void, boolean ] {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const products = useProductsQuery();

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

		// Track a custom event when the user is trying to purchase a product different than
		// the one chosen by the dashboard.
		if ( suggestedProducts?.length && ! isEqual( selectedProducts, suggestedProducts ) ) {
			dispatch(
				recordTracksEvent(
					'calypso_partner_portal_issue_mutiple_licenses_changed_selection_after_dashboard_visit'
				)
			);
		}

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
			return page( nextStep );
		}

		const issueLicenseRequests: any[] = [];

		selectedProducts.forEach( ( product ) => {
			issueLicenseRequests.push( issueLicense.mutateAsync( { product } ) );
		} );
		const issueLicensePromises: any[] = await Promise.allSettled( issueLicenseRequests );

		const issuedLicenses = issueLicensePromises.filter( ( { status } ) => status === 'fulfilled' );

		if ( ! issuedLicenses.length ) {
			return;
		}

		if ( ! selectedSiteId ) {
			let nextStep = partnerPortalBasePath( '/licenses' );
			if ( sites > 0 ) {
				const licenseKeys = issuedLicenses.map( ( { value } ) => value.license_key );
				nextStep = addQueryArgs(
					{
						products: licenseKeys.join( ',' ),
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
				const initialLicenseList = assignedLicenses.slice( 0, -1 ) as string[];
				const lastLicenseItem = assignedLicenses.slice( -1 )[ 0 ] as string;

				const commaCharacter = translate( ',', {
					comment:
						'The character used to separate items in a list, such as the comma in "Jetpack Backup, Jetpack Scan, and Jetpack Boost".',
				} );
				const conjunction =
					assignedLicenses.length > 2
						? translate( '%(commaCharacter)s and ', {
								args: {
									commaCharacter,
									comment:
										'The final separator of a delimited list, such as ", and " in "Jetpack Backup, Jetpack Scan, and Jetpack Boost". Note that the spaces here are important due to the way the final string is constructed.',
								},
						  } )
						: translate( ' and ', {
								args: {
									comment:
										'The way that two words are separated, such as " and " in "Jetpack Backup and Jetpack Scan". Note that the spaces here are important due to the way the final string is constructed.',
								},
						  } );

				const components = {
					strong: <strong />,
				};

				dispatch(
					successNotice(
						// We are not using the same translate method for plural form since we have different arguments.
						assignedLicenses.length > 1
							? translate(
									'{{strong}}%(initialLicenseList)s%(conjunction)s%(lastLicenseItem)s{{/strong}} were succesfully issued',
									{
										args: {
											lastLicenseItem,
											conjunction,
											initialLicenseList: initialLicenseList.join( ', ' ),
										},
										comment:
											'%(initialLicenseList)s is a list of n-1 license names seperated by a translated comma character, %(lastLicenseItem) is the nth license name, and %(conjunction) is a translated "and" text with or without a serial comma based on the licenses count. An example is "Jetpack Backup, Jetpack Scan, and Jetpack Boost" where the initialLicenseList is "Jetpack Backup, Jetpack Scan", the conjunction is ", and", and the lastLicenseItem is "Jetpack Boost". An alternative example is "Jetpack Backup and Jetpack Scan", where initialLicenseList is "Jetpack Backup", conjunction is " and", and lastLienseItem is "Jetpack Boost".',
										components,
									}
							  )
							: translate( '{{strong}}%(assignedLicense)s{{/strong}} was succesfully issued', {
									args: {
										assignedLicense: lastLicenseItem,
									},
									components,
							  } ),
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

		issuedLicenses.forEach( ( promise: any ) => {
			const { value: license } = promise;
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
		return page.redirect( partnerPortalBasePath( '/licenses' ) );
	}, [
		isLoading,
		selectedProducts,
		dispatch,
		selectedSite?.ID,
		selectedSite?.domain,
		paymentMethodRequired,
		fromDashboard,
		issueLicense,
		sites,
		translate,
		products.data,
		assignLicense,
	] );

	return [ issue, isLoading ];
}

/**
 * Handle multiple license assignment
 *
 */
export function useAssignMultipleLicenses(
	selectedLicenseKeys: Array< string >,
	selectedSite: { ID: number; domain: string } | null
): [ () => void, boolean ] {
	const [ assign, isLoading ] = useAssignLicenses( selectedLicenseKeys, selectedSite );
	return [ assign, isLoading ];
}

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

import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import { getProductTitle } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIError, APILicense, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';

const useIssueLicenses = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const { mutateAsync, isIdle } = useIssueLicenseMutation( {
		onError: ( error: APIError ) => {
			if ( error.code === 'missing_valid_payment_method' ) {
				dispatch(
					errorNotice(
						translate(
							'A primary payment method is required.{{br/}} {{a}}Try adding a new payment method{{/a}} or contact support.',
							{
								components: {
									a: (
										<a href="/partner-portal/payment-methods/add?return=/partner-portal/issue-license" />
									),
									br: <br />,
								},
							}
						)
					)
				);

				return;
			}

			dispatch( errorNotice( error.message ) );
		},
		retry: ( errorCount, error ) => {
			// There's a slight delay before the license creation API is made
			// aware when a user adds a payment method and will allow creation
			// of a license.
			// To make this a smoother experience, we silently retry a couple of
			// times if the error is missing_valid_payment_method but the
			// local state shows that a payment method exists.
			if ( ! paymentMethodRequired && error?.code === 'missing_valid_payment_method' ) {
				return errorCount < 5;
			}

			return false;
		},
	} );

	return useMemo( () => {
		const issueLicenses = ( productSlugs: string[] ) => {
			const requests = productSlugs.map( ( slug ) => mutateAsync( { product: slug } ) );
			return Promise.allSettled( requests );
		};

		return {
			isReady: isIdle,
			issueLicenses,
		};
	}, [ mutateAsync, isIdle ] );
};

const useAssignLicensesToSite = ( siteId: number | undefined ) => {
	const dispatch = useDispatch();

	const { mutateAsync, isIdle } = useAssignLicenseMutation( {
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { isPersistent: true } ) );
		},
	} );

	return useMemo( () => {
		const assignLicensesToSite = ( licenseKeys: string[] ) => {
			// We need a valid site ID in order to assign licenses to a site;
			// otherwise, we assign nothing
			if ( ! Number.isInteger( siteId ) ) {
				return Promise.resolve( [] as PromiseSettledResult< APILicense >[] );
			}

			const requests = licenseKeys.map( ( key ) =>
				mutateAsync( { licenseKey: key, selectedSite: siteId as number } )
			);

			return Promise.allSettled( requests );
		};

		return {
			isReady: isIdle,
			assignLicensesToSite,
		};
	}, [ siteId, mutateAsync, isIdle ] );
};

const useGetLicenseIssuedMessage = () => {
	const translate = useTranslate();

	return useCallback(
		( productNames: string[] ) => {
			if ( productNames.length === 0 ) {
				return;
			}

			const components = {
				strong: <strong />,
			};

			if ( productNames.length === 1 ) {
				return translate( '{{strong}}%(productName)s{{/strong}} was successfully issued.', {
					args: {
						productName: productNames[ 0 ],
					},
					components,
				} );
			}

			if ( productNames.length === 2 ) {
				return translate(
					'{{strong}}%(first)s{{/strong}} and {{strong}}%(second)s{{/strong}} were successfully issued.',
					{
						args: {
							first: productNames[ 0 ],
							second: productNames[ 1 ],
						},
						comment:
							'%(first)s and %(second)s are each product names (e.g., "Jetpack Backup," "Jetpack Scan," etc.)',
						components,
					}
				);
			}

			const initialSeparator = translate( ', ', {
				comment:
					'Characters used to separate all but the final item in a list of 3 or more (e.g., the comma and trailing space in "Jetpack Backup, Jetpack Scan, and Jetpack Boost").',
			} ) as string;
			const initialProducts = productNames.slice( 0, -1 ).join( initialSeparator );
			const finalProduct = productNames.at( -1 ) as string;

			return translate(
				'{{strong}}%(initialProducts)s{{/strong}}, and {{strong}}%(finalProduct)s{{/strong}} were successfully issued.',
				{
					args: {
						initialProducts,
						finalProduct,
					},
					comment:
						'%(initialProducts)s is a list of 2+ product names, each separated by list item separator character(s) (e.g., in English, a comma and a trailing space); %(finalProduct)s is the final product name in the list.',
					components,
				}
			);
		},
		[ translate ]
	);
};

const containEquivalentItems = ( arr1: string[], arr2: string[] ) => {
	if ( arr1.length !== arr2.length ) {
		return false;
	}

	const [ sorted1, sorted2 ] = [ [ ...arr1 ].sort(), [ ...arr2 ].sort() ];
	for ( let i = 0; i < sorted1.length; ++i ) {
		// If the two lists are sorted and an element differs between the two
		// at any index, they must not contain exactly the same items
		// in exactly the same quantities
		if ( sorted1[ i ] !== sorted2[ i ] ) {
			return false;
		}
	}

	return true;
};

function useIssueAndAssignLicenses(
	selectedSite?: { ID: number; domain: string } | null,
	suggestedProducts: string[] = []
) {
	const dispatch = useDispatch();
	const products = useProductsQuery();
	const sitesCount = useSelector( getSites ).length;

	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const issueLicenses = useIssueLicenses();
	const assignLicensesToSite = useAssignLicensesToSite( selectedSite?.ID );

	const getLicenseIssuedMessage = useGetLicenseIssuedMessage();

	return useMemo( () => {
		const isReady = issueLicenses.isReady && assignLicensesToSite.isReady;

		const issueAndAssignLicenses = async ( selectedProducts: string[] ) => {
			if ( ! isReady || selectedProducts.length === 0 ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_multiple_licenses_submit', {
					products: selectedProducts.join( ',' ),
				} )
			);

			// We want to know when someone purchases different product(s)
			// from what we recommend on the dashboard
			if (
				suggestedProducts.length > 0 &&
				! containEquivalentItems( selectedProducts, suggestedProducts )
			) {
				dispatch(
					recordTracksEvent(
						'calypso_partner_portal_issue_multiple_licenses_changed_selection_after_dashboard_visit'
					)
				);
			}

			const selectedSiteId = selectedSite?.ID;
			const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';

			// If we need a payment method, redirect now to have the user enter one
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

			const issueLicenseResponses = await issueLicenses.issueLicenses( selectedProducts );

			const issuedLicenses = issueLicenseResponses.filter(
				( p ): p is PromiseFulfilledResult< APILicense > => p.status === 'fulfilled'
			);
			const issuedKeys = issuedLicenses.map( ( { value } ) => value.license_key );
			const issuedProducts = issuedKeys
				.map( ( key ) => {
					const productSlug = key.split( '_' )[ 0 ];
					return products?.data?.find( ( p ) => p.slug === productSlug );
				} )
				.filter( ( p ): p is APIProductFamilyProduct => p !== undefined );

			// Exit early if we don't see any issued licenses matching a product we know
			if ( issuedProducts.length === 0 ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_multiple_licenses_issued', {
					products: issuedProducts.join( ',' ),
				} )
			);

			// If no site is selected, announce that licenses were issued;
			// then, redirect to somewhere more appropriate
			if ( ! selectedSiteId ) {
				const issuedProductNames: string[] = issuedProducts.map( ( { name } ) => name );
				const issuedMessage = getLicenseIssuedMessage( issuedProductNames );
				dispatch( successNotice( issuedMessage, { displayOnNextPage: true } ) );

				// If this user has no sites, send them to the licenses listing page
				if ( sitesCount === 0 ) {
					return page.redirect( partnerPortalBasePath( '/licenses' ) );
				}

				// If they do have a site, send them to a page where they can assign
				// the license(s) we just issued
				const nextStep = addQueryArgs(
					{
						products: issuedKeys.join( ',' ),
					},
					partnerPortalBasePath( '/assign-license' )
				);

				return page.redirect( nextStep );
			}

			// If a specific site is already selected,
			// let's assign the licenses we just issued to it
			const assignLicenseResponses = await assignLicensesToSite.assignLicensesToSite( issuedKeys );

			const assignedLicenses = assignLicenseResponses
				.filter( ( p ): p is PromiseFulfilledResult< APILicense > => p.status === 'fulfilled' )
				.map( ( { status, value } ) => {
					const productSlug = value.license_key.split( '_' )[ 0 ];

					// We already confirmed during/after the issue process that
					// the product slug is in the list of products and has a name
					const productName = products?.data?.find( ( p ) => p.slug === productSlug )
						?.name as string;

					return {
						key: value.license_key,
						name: getProductTitle( productName ),
						status,
					};
				} );

			const assignLicensesStatus = {
				selectedSite: selectedSite?.domain || '',
				selectedProducts: assignedLicenses,
			};

			dispatch( resetSite() );
			dispatch( setPurchasedLicense( assignLicensesStatus ) );

			// If we know this person came from the dashboard,
			// let's politely send them back there
			if ( fromDashboard ) {
				return page.redirect( '/dashboard' );
			}

			// Otherwise, send them to the overview of all licenses
			return page.redirect( partnerPortalBasePath( '/licenses' ) );
		};

		return { issueAndAssignLicenses, isReady };
	}, [
		assignLicensesToSite,
		dispatch,
		getLicenseIssuedMessage,
		issueLicenses,
		paymentMethodRequired,
		products?.data,
		selectedSite,
		sitesCount,
		suggestedProducts,
	] );
}

export default useIssueAndAssignLicenses;

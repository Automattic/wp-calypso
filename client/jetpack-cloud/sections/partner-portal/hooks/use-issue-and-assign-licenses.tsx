import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo } from 'react';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import useAssignLicensesToSite from './use-assign-licenses-to-site';
import useIssueLicenses, { FulfilledIssueLicenseResult } from './use-issue-licenses';

const NO_OP = () => {
	/* Do nothing */
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

type UseIssueAndAssignLicensesOptions = {
	onError?: ( ( error: Error ) => void ) | ( () => void );
};
function useIssueAndAssignLicenses(
	selectedSite?: { ID: number; domain: string } | null,
	options: UseIssueAndAssignLicensesOptions = {}
) {
	const dispatch = useDispatch();
	const products = useProductsQuery();
	const sitesCount = useSelector( getSites ).length;

	const issueLicenses = useIssueLicenses();
	const assignLicensesToSite = useAssignLicensesToSite( selectedSite, {
		onError: options.onError ?? NO_OP,
	} );

	const getLicenseIssuedMessage = useGetLicenseIssuedMessage();

	return useMemo( () => {
		const isReady = issueLicenses.isReady && assignLicensesToSite.isReady;

		const issueAndAssignLicenses = async ( productSlugs: string[] ) => {
			if ( ! isReady || productSlugs.length === 0 ) {
				return;
			}

			const issuedLicenses = ( await issueLicenses.issueLicenses( productSlugs ) ).filter(
				( r ): r is FulfilledIssueLicenseResult => r.status === 'fulfilled'
			);

			const issuedProductSlugs = issuedLicenses
				.map( ( { slug } ) => products?.data?.find?.( ( p ) => p.slug === slug ) )
				.filter( ( p ): p is APIProductFamilyProduct => p !== undefined );

			// Exit early if we don't see any issued licenses matching a product we know
			if ( issuedProductSlugs.length === 0 ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_multiple_licenses_issued', {
					products: issuedProductSlugs.map( ( { slug } ) => slug ).join( ',' ),
				} )
			);

			const issuedKeys = issuedLicenses.map( ( { license_key } ) => license_key );

			// If no site is selected, announce that licenses were issued;
			// then, redirect to somewhere more appropriate
			const selectedSiteId = selectedSite?.ID;
			if ( ! selectedSiteId ) {
				const issuedProductNames: string[] = issuedProductSlugs.map( ( { name } ) => name );
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
			const assignLicensesStatus = await assignLicensesToSite.assignLicensesToSite( issuedKeys );

			dispatch( resetSite() );
			dispatch( setPurchasedLicense( assignLicensesStatus ) );

			// If we know this person came from the dashboard,
			// let's politely send them back there
			const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
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
		products?.data,
		selectedSite,
		sitesCount,
	] );
}

export default useIssueAndAssignLicenses;

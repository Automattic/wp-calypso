import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { type APIError } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import useAssignLicensesToSite from './use-assign-licenses-to-site';
import useIssueLicenses, { type FulfilledIssueLicenseResult } from './use-issue-licenses';

const NO_OP = () => {
	/* Do nothing */
};

// TODO: Rewrite this hook as a const once the feature flag is removed
let useGetLicenseIssuedMessage: () => (
	licenses: FulfilledIssueLicenseResult[]
) => TranslateResult | undefined;
if ( isEnabled( 'jetpack/bundle-licensing' ) ) {
	useGetLicenseIssuedMessage = () => {
		const translate = useTranslate();
		const products = useProductsQuery();

		return useCallback(
			( licenses: FulfilledIssueLicenseResult[] ) => {
				if ( licenses.length === 0 ) {
					return;
				}

				// Only one individual license; let's be more specific
				if ( licenses.length === 1 && ( licenses[ 0 ].quantity ?? 1 ) === 1 ) {
					const productName =
						products?.data?.find?.( ( p ) => p.slug === licenses[ 0 ].slug )?.name ?? '';
					return translate(
						'Thanks for your purchase! Below you can view and assign your new {{strong}}%(productName)s{{/strong}} license to a website.',
						{
							args: {
								productName,
							},
							components: {
								strong: <strong />,
							},
						}
					);
				}

				// Multiple licenses and/or bundles? A generic thanks will suffice.
				return translate(
					'Thanks for your purchase! Below you can view and assign your new Jetpack product licenses to your websites.'
				);
			},
			[ products?.data, translate ]
		);
	};
} else {
	useGetLicenseIssuedMessage = () => {
		const translate = useTranslate();
		const products = useProductsQuery();

		return useCallback(
			( licenses: FulfilledIssueLicenseResult[] ) => {
				if ( licenses.length === 0 ) {
					return;
				}

				const productNames: string[] = licenses
					.map( ( { slug } ) => products?.data?.find?.( ( p ) => p.slug === slug )?.name )
					.filter( ( name ): name is string => Boolean( name ) );
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
			[ products?.data, translate ]
		);
	};
}

type UseIssueAndAssignLicensesOptions = {
	onIssueError?: ( ( error: APIError ) => void ) | ( () => void );
	onAssignError?: ( ( error: Error ) => void ) | ( () => void );
};
function useIssueAndAssignLicenses(
	selectedSite?: { ID: number; domain: string } | null,
	options: UseIssueAndAssignLicensesOptions = {}
) {
	const dispatch = useDispatch();
	const sitesCount = useSelector( getSites ).length;

	const { isReady: isIssueReady, issueLicenses } = useIssueLicenses( {
		onError: options.onIssueError ?? NO_OP,
	} );

	const { isReady: isAssignReady, assignLicensesToSite } = useAssignLicensesToSite( selectedSite, {
		onError: options.onAssignError ?? NO_OP,
	} );

	const getLicenseIssuedMessage = useGetLicenseIssuedMessage();

	return useMemo( () => {
		const isReady = isIssueReady && isAssignReady;

		const issueAndAssignLicenses = async ( productSlugs: string[] ) => {
			if ( ! isReady || productSlugs.length === 0 ) {
				return;
			}

			const issuedLicenses = ( await issueLicenses( productSlugs ) ).filter(
				( r ): r is FulfilledIssueLicenseResult => r.status === 'fulfilled'
			);

			// Exit early if we don't see any issued licenses matching a product we know
			if ( issuedLicenses.length === 0 ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_multiple_licenses_issued', {
					products: issuedLicenses.map( ( { slug } ) => slug ).join( ',' ),
				} )
			);

			const issuedKeys = issuedLicenses.map( ( { license_key } ) => license_key );

			// TODO: Move dispatch events and redirects outside this function
			//
			// If no site is selected, announce that licenses were issued;
			// then, redirect to somewhere more appropriate
			const selectedSiteId = selectedSite?.ID;
			if ( ! selectedSiteId ) {
				const issuedMessage = getLicenseIssuedMessage( issuedLicenses );
				dispatch( successNotice( issuedMessage, { displayOnNextPage: true } ) );

				// If this user has no sites, send them to the licenses listing page
				if ( sitesCount === 0 ) {
					page.redirect( partnerPortalBasePath( '/licenses' ) );
					return;
				}

				// If they do have a site, send them to a page where they can assign
				// the license(s) we just issued
				const nextStep = addQueryArgs(
					{
						products: issuedKeys.join( ',' ),
					},
					partnerPortalBasePath( '/assign-license' )
				);

				page.redirect( nextStep );
				return;
			}

			// If a specific site is already selected,
			// let's assign the licenses we just issued to it
			const assignLicensesStatus = await assignLicensesToSite( issuedKeys );

			// TODO: Move dispatch events and redirects outside this function
			dispatch( resetSite() );
			dispatch( setPurchasedLicense( assignLicensesStatus ) );

			// If we know this person came from the dashboard,
			// let's politely send them back there
			const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
			if ( fromDashboard ) {
				page.redirect( '/dashboard' );
				return;
			}

			// Otherwise, send them to the overview of all licenses
			page.redirect( partnerPortalBasePath( '/licenses' ) );
		};

		return { issueAndAssignLicenses, isReady };
	}, [
		assignLicensesToSite,
		dispatch,
		getLicenseIssuedMessage,
		isAssignReady,
		isIssueReady,
		issueLicenses,
		selectedSite?.ID,
		sitesCount,
	] );
}

export default useIssueAndAssignLicenses;

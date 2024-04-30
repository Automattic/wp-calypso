import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import {
	A4A_LICENSES_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense, resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { type APIError } from 'calypso/state/partner-portal/types';
import useAssignLicensesToSite from './use-assign-licenses-to-site';
import useIssueLicenses, {
	type IssueLicenseRequest,
	type FulfilledIssueLicenseResult,
} from './use-issue-licenses';

const NO_OP = () => {
	/* Do nothing */
};

const useGetLicenseIssuedMessage = () => {
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
				'Thanks for your purchase! Below you can view and assign your new product licenses to your websites.'
			);
		},
		[ products?.data, translate ]
	);
};

type UseIssueAndAssignLicensesOptions = {
	onSuccess?: () => void;
	onIssueError?: ( ( error: APIError ) => void ) | ( () => void );
	onAssignError?: ( ( error: Error ) => void ) | ( () => void );
};
function useIssueAndAssignLicenses(
	selectedSite?: { ID: number; domain: string } | null,
	options: UseIssueAndAssignLicensesOptions = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const products = useProductsQuery();

	const { isReady: isIssueReady, issueLicenses } = useIssueLicenses( {
		onError: options.onIssueError ?? NO_OP,
	} );

	const { isReady: isAssignReady, assignLicensesToSite } = useAssignLicensesToSite( selectedSite, {
		onError: options.onAssignError ?? NO_OP,
	} );

	const getLicenseIssuedMessage = useGetLicenseIssuedMessage();

	return useMemo( () => {
		const isReady = isIssueReady && isAssignReady;

		const issueAndAssignLicenses = async ( selectedLicenses: IssueLicenseRequest[] ) => {
			if ( ! isReady || selectedLicenses.length === 0 ) {
				return;
			}

			const issuedLicenses = ( await issueLicenses( selectedLicenses ) ).filter(
				( r ): r is FulfilledIssueLicenseResult => r.status === 'fulfilled'
			);

			// Exit early if we don't see any issued licenses matching a product we know
			if ( issuedLicenses.length === 0 ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_a4a_multiple_licenses_issued', {
					products: issuedLicenses
						.map( ( license ) => `${ license.slug }:${ license.quantity ?? 1 }` )
						.join( ',' ),
				} )
			);

			// We have issued the licenses successfully so we can now call onSuccess callback regardless if it was able to assign it.
			options.onSuccess?.();

			const issuedKeys = issuedLicenses.map( ( { license_key } ) => license_key );

			// TODO: Move dispatch events and redirects outside this function
			//
			// If no site is selected, announce that licenses were issued;
			// then, redirect to somewhere more appropriate
			const selectedSiteId = selectedSite?.ID;
			if ( ! selectedSiteId ) {
				const issuedMessage = getLicenseIssuedMessage( issuedLicenses );
				dispatch( successNotice( issuedMessage, { displayOnNextPage: true } ) );

				page.redirect( A4A_LICENSES_LINK );
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
			const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'sitesdashboard';
			if ( fromDashboard ) {
				const licenseItem =
					products?.data?.find?.( ( p ) => p.slug === issuedLicenses[ 0 ].slug )?.name ?? '';
				const message =
					selectedSite?.domain && licenseItem
						? translate(
								'{{strong}}%(licenseItem)s{{/strong}} was successfully assigned to ' +
									'{{em}}%(selectedSite)s{{/em}}. Please allow a few minutes ' +
									'for your features to activate.',
								{
									args: { selectedSite: selectedSite.domain, licenseItem },
									components: {
										strong: <strong />,
										em: <em />,
									},
								}
						  )
						: translate( 'Your license has been successfully issued and assigned to your site.' );
				dispatch( successNotice( message, { displayOnNextPage: true } ) );

				page.redirect( A4A_SITES_LINK );
				return;
			}

			// Otherwise, send them to the overview of all licenses
			page.redirect( A4A_LICENSES_LINK );
		};

		return { issueAndAssignLicenses, isReady };
	}, [
		assignLicensesToSite,
		dispatch,
		getLicenseIssuedMessage,
		isAssignReady,
		isIssueReady,
		issueLicenses,
		options,
		selectedSite?.ID,
		selectedSite?.domain,
		products?.data,
		translate,
	] );
}

export default useIssueAndAssignLicenses;

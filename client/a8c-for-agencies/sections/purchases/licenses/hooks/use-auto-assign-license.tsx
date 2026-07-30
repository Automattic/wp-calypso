import page from '@automattic/calypso-router';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { getFetchLicenseCountsQueryKey } from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import useFetchLicenses, {
	FETCH_LICENSES_QUERY_KEY_PREFIX,
} from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import useAssignLicenseMutation from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-assign-license-mutation';
import { getManualAssignLicenseUrl } from 'calypso/a8c-for-agencies/sections/marketplace/lib/assign-license-url';
import { getProductSlugFromLicenseKey } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { License } from 'calypso/state/partner-portal/types';

// License keys embed at most the first 38 characters of the product slug.
const LICENSE_KEY_SLUG_LENGTH = 38;

function findUnassignedLicensesForProduct( licenses: License[], productSlug: string ) {
	const keySlug = productSlug.substring( 0, LICENSE_KEY_SLUG_LENGTH );

	return licenses
		.filter(
			( license ) =>
				! license.blogId && getProductSlugFromLicenseKey( license.licenseKey ) === keySlug
		)
		.sort( ( a, b ) => Date.parse( b.issuedAt ) - Date.parse( a.issuedAt ) );
}

function readNumberArg( name: string ) {
	return Number( getQueryArg( window.location.href, name ) ) || undefined;
}

/**
 * Assigns a freshly purchased license to the site it was bought for.
 *
 * Checkout sends the buyer back here with the site and product it bought so the
 * license they just paid for does not land unassigned in the list.
 */
export default function useAutoAssignLicense() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );
	const hasStarted = useRef( false );

	const siteId = readNumberArg( 'site_id' );
	const receiptId = readNumberArg( 'receipt_id' );
	const productSlug = getQueryArg( window.location.href, 'product_slug' )?.toString();
	const isRequested = !! siteId && !! productSlug;

	const { data, isPending } = useFetchLicenses(
		LicenseFilter.Detached,
		'',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		1,
		undefined,
		isRequested
	);

	const { mutateAsync: assignLicense } = useAssignLicenseMutation();

	useEffect( () => {
		if ( ! siteId || ! productSlug || hasStarted.current || isPending ) {
			return;
		}
		hasStarted.current = true;

		const track = ( outcome: string, licenseKey?: string ) =>
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_auto_assign_license', {
					outcome,
					site_id: siteId,
					product_slug: productSlug,
					receipt_id: receiptId,
					license_key: licenseKey,
				} )
			);

		const clearQueryArgs = () => page.replace( window.location.pathname, undefined, false, false );

		const candidates = findUnassignedLicensesForProduct( data?.items ?? [], productSlug );

		if ( candidates.length === 0 ) {
			track( 'no_match' );
			clearQueryArgs();
			return;
		}

		// More than one unassigned license matches the product we just bought, so we
		// cannot tell which one it is. Let the user confirm rather than guess.
		if ( candidates.length > 1 ) {
			track( 'ambiguous', candidates[ 0 ].licenseKey );
			page.redirect( getManualAssignLicenseUrl( candidates[ 0 ].licenseKey, siteId ) );
			return;
		}

		const [ license ] = candidates;

		assignLicense( { licenseKey: license.licenseKey, selectedSite: siteId } )
			.then( () => {
				track( 'assigned', license.licenseKey );
				queryClient.invalidateQueries( { queryKey: [ FETCH_LICENSES_QUERY_KEY_PREFIX ] } );
				queryClient.invalidateQueries( { queryKey: getFetchLicenseCountsQueryKey( agencyId ) } );
				dispatch(
					successNotice(
						translate(
							'{{strong}}%(licenseItem)s{{/strong}} was assigned to your site. Please allow a few minutes for your features to activate.',
							{
								args: { licenseItem: license.product },
								components: { strong: <strong /> },
							}
						),
						{ id: 'assign_license_success' }
					)
				);
				clearQueryArgs();
			} )
			.catch( ( error: Error ) => {
				track( 'assign_failed', license.licenseKey );
				dispatch(
					errorNotice( error.message, { id: 'assign_license_error', displayOnNextPage: true } )
				);
				page.redirect( getManualAssignLicenseUrl( license.licenseKey, siteId ) );
			} );
	}, [
		agencyId,
		assignLicense,
		data?.items,
		dispatch,
		isPending,
		productSlug,
		queryClient,
		receiptId,
		siteId,
		translate,
	] );
}

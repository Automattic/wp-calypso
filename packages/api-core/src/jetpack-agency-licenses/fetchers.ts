import { wpcom } from '../wpcom-fetcher';
import type {
	FetchJetpackLicensesOptions,
	FetchJetpackLicensesPageOptions,
	JetpackLicense,
	JetpackLicenseCounts,
	JetpackLicenseDownloadUrl,
	JetpackLicensesPage,
} from './types';

const FETCH_SIZE = 100;

export async function fetchJetpackLicensesPage(
	agencyId: number,
	{
		filter,
		search,
		sortField,
		sortDirection,
		page = 1,
		perPage = FETCH_SIZE,
	}: FetchJetpackLicensesPageOptions
): Promise< JetpackLicensesPage > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses',
		},
		{
			...( agencyId && { agency_id: agencyId } ),
			...( search && { search } ),
			filter,
			page,
			sort_field: sortField,
			sort_direction: sortDirection,
			per_page: perPage,
		}
	);
}

export async function fetchJetpackLicenses(
	agencyId: number,
	options: FetchJetpackLicensesOptions
): Promise< JetpackLicense[] > {
	let currentPage = 1;
	let hasMorePages = true;
	const licenses: JetpackLicense[] = [];

	while ( hasMorePages ) {
		const response = await fetchJetpackLicensesPage( agencyId, {
			...options,
			page: currentPage,
			perPage: FETCH_SIZE,
		} );

		licenses.push( ...response.items );

		hasMorePages = currentPage < response.total_pages;
		currentPage++;
	}

	return licenses;
}

export async function fetchJetpackLicenseCounts(
	agencyId: number
): Promise< JetpackLicenseCounts > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses/counts',
		},
		{ agency_id: agencyId }
	);
}

export async function fetchJetpackLicenseDownloadUrl(
	agencyId: number | undefined,
	licenseKey: string
): Promise< JetpackLicenseDownloadUrl > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to download a license' );
	}
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/jetpack-licensing/license/${ licenseKey }/download`,
		},
		{ agency_id: agencyId }
	);
}

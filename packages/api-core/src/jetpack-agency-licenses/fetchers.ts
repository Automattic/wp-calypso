import { wpcom } from '../wpcom-fetcher';
import type { FetchJetpackLicensesOptions, JetpackLicense } from './types';

const FETCH_SIZE = 100;

interface JetpackLicensesResponse {
	items: JetpackLicense[];
	total_pages: number;
}

export async function fetchJetpackLicenses(
	agencyId: number,
	{ filter, search, sortField, sortDirection }: FetchJetpackLicensesOptions
): Promise< JetpackLicense[] > {
	let currentPage = 1;
	let hasMorePages = true;
	const licenses: JetpackLicense[] = [];

	while ( hasMorePages ) {
		const response: JetpackLicensesResponse = await wpcom.req.get(
			{
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/licenses',
			},
			{
				...( agencyId && { agency_id: agencyId } ),
				...( search && { search } ),
				filter,
				page: currentPage,
				sort_field: sortField,
				sort_direction: sortDirection,
				per_page: FETCH_SIZE,
			}
		);

		licenses.push( ...response.items );

		hasMorePages = currentPage < response.total_pages;
		currentPage++;
	}

	return licenses;
}

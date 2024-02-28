import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { LICENSES_PER_PAGE } from 'calypso/a8c-for-agencies/sections/purchases/lib/constants';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

export default function useFetchLicenses(
	filter: LicenseFilter,
	search: string,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection,
	page: number
) {
	const showDummyData = config.isEnabled( 'a4a/mock-api-data' );

	const getLicenses = () => {
		if ( showDummyData ) {
			return {
				items: [
					{
						licenseId: 1,
						licenseKey: 'license-key',
						product: 'dummy-product',
						blogId: 1,
						siteUrl: 'dummy-url',
						hasDownloads: true,
						issuedAt: '2021-01-01',
						attachedAt: '2021-01-01',
						quantity: undefined,
						revokedAt: null,
						ownerType: 'jetpack_partner_key',
						parentLicenseId: null,
					},
				],
				total_pages: 1,
				total_items: 1,
				items_per_page: LICENSES_PER_PAGE,
			};
		}
		return {
			items: [],
			total_pages: 0,
			total_items: 0,
			items_per_page: LICENSES_PER_PAGE,
		}; // FIXME: This is a placeholder for the actual API call.
	};

	return useQuery( {
		queryKey: [ 'a4a-licenses', filter, search, sortField, sortDirection, page ],
		queryFn: () => getLicenses(),
		select: ( data ) => {
			return {
				items: data.items,
				total: data.total_items,
				perPage: data.items_per_page,
				totalPages: data.total_pages,
			};
		},
	} );
}

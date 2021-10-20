import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from 'react-query';
import wpcom from 'calypso/lib/wp';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';

export interface PaginatedItems< T > {
	currentItems: number;
	currentPage: number;
	items: T[];
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
}

interface APILicense {
	license_id: number;
	license_key: string;
	product_id: number;
	product: string;
	user_id: number | null;
	username: string | null;
	blog_id: number | null;
	siteurl: string | null;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
}

export interface License {
	licenseId: number;
	licenseKey: string;
	productId: number;
	product: string;
	userId: number | null;
	username: string | null;
	blogId: number | null;
	siteurl: string | null;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
}

/**
 *
 */
const useJetpackLicenseQuery = (
	filter?: LicenseFilter,
	search?: string,
	sortField?: LicenseSortField,
	sortDirection?: LicenseSortDirection
): UseInfiniteQueryResult< License[], unknown > => {
	return useInfiniteQuery< PaginatedItems< APILicense >, unknown, License[] >(
		[ 'jetpack-licenses', filter, search, sortField, sortDirection ],
		async ( { pageParam = 1 } ) =>
			wpcom.req.get(
				{
					path: '/jetpack-licensing/licenses/user',
					apiNamespace: 'wpcom/v2',
				},
				{
					filter,
					page: pageParam,
					per_page: 5,
					search,
					sort_direction: sortDirection,
					sort_field: sortField,
				}
			),
		{
			getNextPageParam: ( lastPage ) => {
				if ( lastPage.currentPage <= lastPage.totalPages ) {
					return;
				}
				return lastPage.currentPage + 1;
			},
			getPreviousPageParam: ( lastPage ) => {
				if ( lastPage.currentPage === 1 ) {
					return;
				}
				return lastPage.currentPage - 1;
			},
			select: ( data ) => ( {
				...data,
				pages: data.pages.map( ( { items } ) =>
					items.map( ( apiLicence ) => ( {
						licenseId: apiLicence.license_id,
						licenseKey: apiLicence.license_key,
						productId: apiLicence.product_id,
						product: apiLicence.product,
						userId: apiLicence.user_id,
						username: apiLicence.username,
						blogId: apiLicence.blog_id,
						siteurl: apiLicence.siteurl,
						issuedAt: apiLicence.issued_at,
						attachedAt: apiLicence.attached_at,
						revokedAt: apiLicence.revoked_at,
					} ) )
				),
			} ),
		}
	);
};

export default useJetpackLicenseQuery;

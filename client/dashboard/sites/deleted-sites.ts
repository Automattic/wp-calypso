import type { FetchPaginatedSitesOptions, User } from '@automattic/api-core';

export const deletedSitesCheckFetchOptions: FetchPaginatedSitesOptions = {
	site_visibility: 'deleted',
	include_a8c_owned: false,
	per_page: 1,
};

export function hasNoLiveSites( user: User | undefined ): boolean {
	return user?.site_count === 0;
}

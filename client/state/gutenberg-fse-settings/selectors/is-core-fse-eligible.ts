import { queryCache } from 'calypso/state/query-cache';
import { makeQueryKey, SuccessResponse, GutenbergFSESettings } from '../init';

export const isCoreFSEEligible = ( siteId: string ): boolean => {
	const cached = queryCache.find<
		SuccessResponse< GutenbergFSESettings >,
		unknown,
		GutenbergFSESettings
	>( makeQueryKey( siteId ) );

	return cached?.state.data?.is_core_fse_eligible ?? false;
};

export default isCoreFSEEligible;

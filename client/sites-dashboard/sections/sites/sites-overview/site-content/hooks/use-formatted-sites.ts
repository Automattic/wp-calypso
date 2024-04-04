import { useCallback, useMemo } from 'react';
import { SiteData } from '../../types';
import type { SiteExcerptData } from '@automattic/sites';

const useFormatSite = () => {
	return useCallback(
		( site: SiteExcerptData ): SiteData => {
		return {
			site: {
				value: site,
				error: false,
				status: 'active',
				type: 'site',
			},
		};
	}, [] );
};

/**
 * Returns formatted sites
 */
const useFormattedSites = ( sites: SiteExcerptData[] ): SiteData[] => {
	const formatSite = useFormatSite();

	return useMemo( () => sites.map( ( site ) => formatSite( site ) ), [ formatSite, sites ] );
};

export default useFormattedSites;

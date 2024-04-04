import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { SiteExcerptData } from '@automattic/sites';

const useSiteCountText = ( sites: SiteExcerptData[] ) => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( ! sites.length ) {
			return null;
		}

		if ( sites.length === 1 ) {
			return sites[ 0 ].URL;
		}

		return translate( '%(siteCount)d sites', {
			args: { siteCount: sites.length },
			comment: '%(siteCount) is no of sites selected, e.g. "2 sites"',
		} );
	}, [ sites, translate ] );
};

export default useSiteCountText;

import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Site } from '../types';

const useSiteCountText = ( sites: Site[] ) => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( ! sites.length ) {
			return null;
		}

		if ( sites.length === 1 ) {
			return sites[ 0 ].url;
		}

		return translate( '%(siteCount)d sites', {
			args: { siteCount: sites.length },
			comment: '%(siteCount) is no of sites selected, e.g. "2 sites"',
		} );
	}, [ sites, translate ] );
};

export default useSiteCountText;

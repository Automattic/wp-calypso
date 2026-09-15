import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSiteIdentifier } from './use-site-identifier';
import type { SiteSelect } from '@automattic/data-stores';

type SiteSelectWithResolution = SiteSelect & {
	hasFinishedResolution: (
		selectorName: 'getSite',
		args: [ siteIdOrSlug: number | string ]
	) => boolean;
};

export function useSiteResolution( siteFragment?: number | string ) {
	const siteIdOrSlug = useSiteIdentifier( siteFragment );

	return useSelect(
		( select ) => {
			if ( ! siteIdOrSlug ) {
				return true;
			}

			const siteStore = select( SITE_STORE ) as SiteSelectWithResolution;

			return siteStore.hasFinishedResolution( 'getSite', [ siteIdOrSlug ] );
		},
		[ siteIdOrSlug ]
	);
}

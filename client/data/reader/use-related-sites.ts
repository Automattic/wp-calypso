import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { decodeEntities } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';

export interface RelatedSite {
	global_ID: string;
	site_ID: number;
	name: string;
	URL: string;
	last_updated: number;
	unseen_count: number;
	site_icon: string | null;
	post_author: number;
	feed_ID: number;
	description: string;
}

interface Site {
	global_ID: string;
	site_ID: number;
	site_name: string;
	site_URL: string;
	site_icon: {
		img: string;
		ico: string;
	} | null;
	description: string;
	author: number;
	feed_ID: number;
}

const selectRelatedSites = ( response: { sites: Site[] } ): RelatedSite[] | null => {
	if ( ! response?.sites ) {
		return null;
	}
	const relatedSites: RelatedSite[] = response?.sites.map( ( site: Site ) => ( {
		global_ID: site.global_ID,
		site_ID: site.site_ID,
		name: decodeEntities( site.site_name ),
		URL: site.site_URL,
		last_updated: 0,
		unseen_count: 0,
		site_icon: site.site_icon?.img || site.site_icon?.ico || null,
		post_author: site.author,
		feed_ID: site.feed_ID,
		description: decodeEntities( site.description ),
	} ) );
	return relatedSites.length > 0 ? relatedSites : null;
};

export const useRelatedSites = ( siteId: number ): UseQueryResult< RelatedSite[] | null > => {
	const site_recs = 5;
	const path =
		'/read/site/' + siteId + '/sites/related?size_global=' + site_recs + '&http_envelope=1';
	return useQuery(
		[ 'related-sites-' + site_recs, siteId ],
		() => wpcom.req.get( { path: path, apiNamespace: 'rest/v1.2' } ),
		{
			enabled: !! siteId,
			staleTime: 3600000, // 1 hour
			select: selectRelatedSites,
		}
	);
};

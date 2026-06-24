import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import wp from 'calypso/lib/wp';

export interface TagStats {
	total_posts: number; // Number of posts in the time period.
	total_sites: number; // Number of sites that posted in the time period.
	posts_per_day: number; // Average number of posts per day in the time period.
	last_post_date_gmt?: string; //(ISO 8601 datetime) Datetime for the most recent post in the time period.
}

export const useTagStats = ( tag: string ): UseQueryResult< TagStats | null > => {
	// The endpoint reads `lang` (not `locale`) and only matches the ES index for base
	// language codes (`pt`, `de`, …). Regional variants like `pt_BR`/`pt-br` (which
	// `get_user_locale()` returns for users with that interface language) match nothing
	// and the response collapses to `{ total_posts: 0, total_sites: 1 }`. Send the base
	// slug explicitly so counters match what the timeline renders for the user.
	const lang = getLocaleSlug()?.split( '-' )[ 0 ] ?? undefined;

	return useQuery( {
		// `lang` is part of the key: the response varies by language, so cached counts
		// must not leak across an interface-language switch.
		queryKey: [ 'tag-stats', tag, lang ],
		queryFn: () =>
			wp.req.get( `/read/topics/${ encodeURIComponent( tag ) }/stats`, {
				apiVersion: '1.3',
				lang,
			} ),
		staleTime: 86400000, // 1 day
		refetchOnMount: 'always',
	} );
};

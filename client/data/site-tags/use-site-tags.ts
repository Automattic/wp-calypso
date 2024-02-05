import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import wp from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

const TagSchema = z.object( {
	id: z.number(),
	count: z.number(),
	description: z.string(),
	link: z.string().url(),
	name: z.string(),
	slug: z.string(),
	taxonomy: z.literal( 'post_tag' ),
	meta: z.array( z.unknown() ),
} );

const SiteTagsResponseSchema = z.array( TagSchema );

export const useSiteTags = ( siteId: SiteId ) =>
	useQuery( {
		enabled: !! siteId,
		queryKey: [ 'site-tags', siteId ],
		queryFn: async () => {
			const response = await wp.req.get(
				`/sites/${ siteId }/tags?order=desc&orderby=count&per_page=10`,
				{
					apiNamespace: 'wp/v2',
				}
			);
			const result = SiteTagsResponseSchema.safeParse( response );
			// @TODO this seems bad, think more about error handling
			// as we're using a `staleTime` of 10 minutes, we may end
			// up with an empty array for a while if the request fails
			return result.success ? result.data : [];
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	} );

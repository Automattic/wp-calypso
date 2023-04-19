import { useQuery, UseQueryResult } from 'react-query';
import { decodeEntities } from 'calypso/lib/formatting';
import wp from 'calypso/lib/wp';

export interface RelatedSiteByTag {
	site_ID: number;
	feed_ID: number;
	name: string;
	URL: string;
	last_updated: number;
	unseen_count: number;
	site_icon: string | null;
}

export interface RelatedTagByTag {
	slug: string;
	title: string;
	score: number;
}

export interface RelatedMetaByTag {
	related_sites: RelatedSiteByTag[] | null;
	related_tags: RelatedTagByTag[] | null;
}

interface Card {
	type: string;
	data?: {
		site_ID: number;
		feed_ID: number;
		name: string;
		URL: string;
		icon: string;
	}[];
}

interface Site {
	ID: number;
	feed_ID: number;
	name: string;
	URL: string;
	icon: string;
}

interface Tag {
	slug: string;
	title: string;
	score: number;
}

const selectRelatedSites = ( response: { cards: Card[] } ): RelatedSiteByTag[] | null => {
	const relatedSitesByTag: RelatedSiteByTag[] = response.cards
		.filter( ( card ) => card.type === 'recommended_blogs' && card.data )
		.flatMap( ( card ) => card.data! )
		.map( ( site: Site ) => ( {
			site_ID: site.ID,
			feed_ID: site.feed_ID,
			name: decodeEntities( site.name ),
			URL: site.URL,
			last_updated: 0,
			unseen_count: 0,
			site_icon: site.icon?.img || site.icon?.ico || null,
		} ) );

	return relatedSitesByTag.length > 0 ? relatedSitesByTag : null;
};

const selectRelatedTags = ( response: { cards: Card[] } ): RelatedTagByTag[] | null => {
	const relatedTagByTag: RelatedTagByTag[] = response.cards
		.filter( ( card ) => card.type === 'interests_you_may_like' && card.data )
		.flatMap( ( card ) => card.data! )
		.map( ( tag: Tag ) => ( {
			slug: tag.slug,
			title: tag.title,
			score: tag.score,
		} ) );

	return relatedTagByTag.length > 0 ? relatedTagByTag : null;
};

const selectFromCards = ( response: {
	cards: Card[];
	total: number;
} ): RelatedMetaByTag | null => ( {
	related_sites: selectRelatedSites( response ),
	related_tags: selectRelatedTags( response ),
} );

export const useRelatedMetaByTag = ( tag: string ): UseQueryResult< RelatedMetaByTag | null > =>
	useQuery(
		[ 'related-meta-by-tag', tag ],
		() =>
			wp.req.get( {
				path: `/read/tags/${ tag }/cards`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			staleTime: 86400000, // 1 day
			select: selectFromCards,
		}
	);

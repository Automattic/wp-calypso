import { useQuery, UseQueryResult } from '@tanstack/react-query';
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
		ID: number;
		site_ID: number;
		feed_ID: number;
		name: string;
		URL: string;
		icon: {
			img: string;
			ico: string;
		};
		slug: string;
		title: string;
		score: number;
	}[];
}

interface Site {
	ID: number;
	feed_ID: number;
	name: string;
	URL: string;
	icon: {
		img: string;
		ico: string;
	};
}

interface Tag {
	slug: string;
	title: string;
	score: number;
}

const selectRelatedSites = ( response: { cards: Card[] } ): RelatedSiteByTag[] | null => {
	const relatedSitesByTag: RelatedSiteByTag[] = response.cards
		// Filter the cards array to only include cards of type "recommended_blogs" that have a data property
		.filter( ( card ) => card.type === 'recommended_blogs' && card.data )
		// Use flatMap to flatten the data arrays of each of the filtered cards into a single array (ignoring arrays without data property)
		.flatMap( ( card ) => card.data! )
		// Map over the flattened data array to create a new array of objects with properties for site_ID, feed_ID, name, URL, last_updated, unseen_count, and site_icon.
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
		// Filter the cards array to only include cards of type "interests_you_may_like" that have a data property
		.filter( ( card ) => card.type === 'interests_you_may_like' && card.data )
		// Use flatMap to flatten the data arrays of each of the filtered cards into a single array (ignoring arrays without data property)
		.flatMap( ( card ) => card.data! )
		// Map over the flattened data array to create a new array of objects with properties for slug, title, and score.
		.map( ( tag: Tag ) => ( {
			slug: tag.slug,
			title: tag.title,
			score: tag.score,
		} ) )
		// Sort the array by score in descending order (highest score first)
		.sort( ( a, b ) => b.score - a.score );

	return relatedTagByTag.length > 0 ? relatedTagByTag : null;
};

const selectFromCards = ( response: {
	cards: Card[];
	total: number;
} ): RelatedMetaByTag | null => ( {
	related_sites: selectRelatedSites( response ),
	related_tags: selectRelatedTags( response ),
} );

export const useRelatedMetaByTag = ( tag: string ): UseQueryResult< RelatedMetaByTag | null > => {
	const tag_recs_per_card = 10;
	const site_recs_per_card = 5;
	return useQuery( {
		queryKey: [ 'related-meta-by-tag', tag_recs_per_card, site_recs_per_card, tag ],
		queryFn: () =>
			wp.req.get( {
				path: `/read/tags/${ encodeURIComponent(
					tag
				) }/cards?tag_recs_per_card=${ tag_recs_per_card }&site_recs_per_card=${ site_recs_per_card }`,
				apiNamespace: 'wpcom/v2',
			} ),
		staleTime: 3600000,
		select: selectFromCards,
	} );
};

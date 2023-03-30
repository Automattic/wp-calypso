import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import performanceMark from 'calypso/server/lib/performance-mark';
import TagsPage from './main';
import type { Context as PageJSContext } from 'page';

const debug = debugFactory( 'calypso:reader:tags' );

export interface TagData {
	tags: TagResult[];
}

export interface TagResult {
	count: number;
	tag: Tag;
}

export interface Tag {
	slug: string;
	title: string;
}

export const tagsListing = ( context: PageJSContext, next: () => void ) => {
	context.headerSection = renderHeaderSection();
	context.primary = <TagsPage trendingTags={ context.params.trendingTags } />;
	next();
};

function renderHeaderSection() {
	return (
		<>
			<h1>{ 
				// translators: The title of the reader trending tags page
				translate( 'Tags' ) 
			}</h1>
			<p>{ translate( 'Discover unique topics, follow your interests, or start writing.' ) }</p>
		</>
	);
}

export const fetchTrendingTags = ( context: PageJSContext, next: ( e?: Error ) => void ) => {
	if ( context.cachedMarkup ) {
		debug( 'Skipping trending tags data fetch' );
		return next();
	}
	performanceMark( context as any, 'fetchTrendingTags' );

	context.queryClient
		.fetchQuery(
			[ 'trending-tags' ],
			() => {
				return wpcom.req.get( '/read/trending/tags', {
					apiVersion: '1.2',
					count: '6',
					locale: context.lang, // Note: undefined will be omitted by the query string builder.
				} );
			},
			{ staleTime: 86400000 } // 24 hours
		)
		.then( ( trendingTags: { tags: TagResult[] } ) => {
			context.params.trendingTags = trendingTags.tags;
			next();
		} )
		.catch( ( error: Error ) => {
			next( error );
		} );
};

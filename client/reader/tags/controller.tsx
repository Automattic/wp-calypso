import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import performanceMark, { PartialContext } from 'calypso/server/lib/performance-mark';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
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

export interface AlphabeticTagsResult {
	[ key: string ]: Tag[];
}

export const tagsListing = ( context: PageJSContext, next: () => void ) => {
	context.headerSection = renderHeaderSection();
	context.primary = (
		<TagsPage
			trendingTags={ context.params.trendingTags }
			alphabeticTags={ context.params.alphabeticTags }
		/>
	);
	next();
};

function renderHeaderSection() {
	return (
		<>
			<h1>
				{
					// translators: The title of the reader trending tags page
					translate( 'All the Tags' )
				}
			</h1>
			<p>{ translate( "For every one of your interests, there's a tag on WordPress.com." ) }</p>
		</>
	);
}

export const fetchTrendingTags = ( context: PageJSContext, next: ( e?: Error ) => void ) => {
	if ( context.cachedMarkup ) {
		debug( 'Skipping trending tags data fetch' );
		return next();
	}
	performanceMark( context as PartialContext, 'fetchTrendingTags' );

	const currentUserLocale = getCurrentUserLocale( context.store.getState() );

	context.queryClient
		.fetchQuery(
			[ 'trending-tags', currentUserLocale ?? '' ],
			() => {
				return wpcom.req.get( '/read/trending/tags', {
					apiVersion: '1.2',
					count: '6',
					lang: currentUserLocale, // Note: undefined will be omitted by the query string builder.
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

export const fetchAlphabeticTags = ( context: PageJSContext, next: ( e?: Error ) => void ) => {
	if ( context.cachedMarkup ) {
		debug( 'Skipping alphabetic tags data fetch' );
		return next();
	}
	performanceMark( context as PartialContext, 'fetchAlphabeticTags' );

	const currentUserLocale = getCurrentUserLocale( context.store.getState() );

	context.queryClient
		.fetchQuery(
			[ 'alphabetic-tags', currentUserLocale ?? '' ],
			() => {
				return wpcom.req.get( '/read/tags/alphabetic', {
					apiVersion: '1.2',
					lang: currentUserLocale, // Note: undefined will be omitted by the query string builder.
				} );
			},
			{ staleTime: 86400000 } // 24 hours
		)
		.then( ( alphabeticTags: AlphabeticTagsResult ) => {
			context.params.alphabeticTags = alphabeticTags;
			next();
		} )
		.catch( ( error: Error ) => {
			next( error );
		} );
};

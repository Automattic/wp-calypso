import { setDocumentHeadMeta } from 'calypso/state/document-head/actions';
import { getDocumentHeadMeta } from 'calypso/state/document-head/selectors';

/**
 * Mark tag-parameterized Discover pages (`/discover/tags?selectedTag=…`) as `noindex`.
 *
 * Requests with query args are never server-side rendered (@see setShouldServerSideRender),
 * so `DiscoverDocumentHead` does not run on the server for these URLs. The document head is
 * still built from the store, so dispatch the robots meta directly to get it into the HTML.
 * The bare `/discover/tags` page is left indexable.
 */
export function setDiscoverTagNoindex( context, next ) {
	if ( context.query?.selectedTag ) {
		const meta = getDocumentHeadMeta( context.store.getState() )
			.filter( ( { name } ) => name !== 'robots' )
			.concat( { name: 'robots', content: 'noindex' } );

		context.store.dispatch( setDocumentHeadMeta( meta ) );
	}

	next();
}

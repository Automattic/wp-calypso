/* eslint-disable no-restricted-imports */
import { useCallback } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { useNavigate } from 'react-router-dom';
import { preventWidows } from 'calypso/lib/formatting';
import type { SearchResult } from '../types';
import { useHelpCenterTracksEvent } from './use-help-center-tracks-event';

type Options = {
	/** Query that produced the result, recorded on the event and carried into the article view. */
	searchQuery: string;
	/** Site the support flow is about, when the caller knows better than the Help Center context. */
	explicitSiteId?: unknown;
};

/**
 * Opens a search result: inside the Help Center when the result has a post id, in a new
 * tab otherwise. Only the new-tab case records an event, because the in-app route records
 * its own.
 */
export function useRedirectToArticle( { searchQuery, explicitSiteId }: Options ) {
	const navigate = useNavigate();
	const recordTracksEvent = useHelpCenterTracksEvent( { explicitSiteId } );

	return useCallback(
		( event: React.MouseEvent< HTMLAnchorElement, MouseEvent >, result: SearchResult ) => {
			event.preventDefault();

			if ( ! result.post_id ) {
				recordTracksEvent( 'calypso_inlinehelp_article_no_postid_redirect', {
					search_query: searchQuery,
					force_site_id: true,
					location: 'help-center',
					result_url: result.link,
					post_id: result.post_id,
					// Article blog, not the site the user needs help with.
					article_blog_id: result.blog_id,
				} );
				window.open( result.link, '_blank' );
				return;
			}

			const params = new URLSearchParams( {
				link: result.link,
				postId: String( result.post_id ),
				query: searchQuery,
				title: preventWidows( decodeEntities( result.title ) ),
			} );

			if ( result.blog_id ) {
				params.set( 'blogId', String( result.blog_id ) );
			}

			navigate( `/post/?${ params }` );
		},
		[ navigate, recordTracksEvent, searchQuery ]
	);
}

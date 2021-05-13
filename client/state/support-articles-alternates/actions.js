/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { keyToString } from 'calypso/reader/post-key';
import {
	SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/support-articles-alternates/init';

export const fetchAlternatesReceive = ( postKey, payload ) => ( {
	type: SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
	postKey,
	payload,
} );

export const fetchAlternatesRequest = ( postKey ) => ( {
	type: SUPPORT_ARTICLE_ALTERNATES_REQUEST,
	postKey,
} );

export const fetchAlternatesRequestSuccess = ( postKey ) => ( {
	type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
	postKey,
} );

export const fetchAlternatesRequestFailure = ( postKey, error ) => ( {
	type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
	postKey,
	error,
} );

export const fetchAlternates = ( payload ) => ( dispatch ) => {
	const { blogId, postId } = payload;
	const postKey = keyToString( payload );

	dispatch( fetchAlternatesRequest( postKey ) );

	return wpcom
		.undocumented()
		.supportAlternates( { site: blogId, postId } )
		.then( ( data ) => {
			dispatch( fetchAlternatesReceive( postKey, data ) );
			return dispatch( fetchAlternatesRequestSuccess( postKey ) );
		} )
		.catch( ( error ) => {
			return dispatch( fetchAlternatesRequestFailure( postKey, error ) );
		} );
};

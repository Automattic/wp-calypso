/**
 * External dependencies
 */
import { get, has, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { keyToString } from 'reader/post-key';

export const isRequestingSupportArticleAlternates = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return (
		has( state.supportArticlesAlternates.requests, [ postKey ] ) &&
		isEmpty( get( state.supportArticlesAlternates.requests, [ postKey ] ) )
	);
};

export const isRequestingSupportArticleAlternatesCompleted = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.requests, [ postKey, 'completed' ], false );
};

export const isRequestingSupportArticleAlternatesFailed = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.requests, [ postKey, 'failed' ], false );
};

export const shouldRequestSupportArticleAlternates = ( state, postKeySegments ) => {
	return (
		! isRequestingSupportArticleAlternates( state, postKeySegments ) &&
		! isRequestingSupportArticleAlternatesCompleted( state, postKeySegments )
	);
};

export const getSupportArticleAlternates = ( state, postKeySegments ) => {
	const postKey = keyToString( postKeySegments );

	return get( state.supportArticlesAlternates.items, [ postKey ] );
};

export const getSupportArticleAlternatesForLocale = ( state, postKeySegments, locale ) => {
	return get( getSupportArticleAlternates( state, postKeySegments ), [ locale ] );
};

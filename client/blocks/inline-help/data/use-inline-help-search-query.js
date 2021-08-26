import { createHigherOrderComponent } from '@wordpress/compose';
import React from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
import getContextualHelpResults from 'calypso/state/inline-help/selectors/get-contextual-help-results';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import { SUPPORT_TYPE_API_HELP, SUPPORT_TYPE_CONTEXTUAL_HELP } from '../constants';

export const useInlineHelpSearchQuery = ( search, queryOptions = {} ) => {
	const inlineHelpQuery = useQuery(
		[ 'inline-help', search ],
		async () => {
			const { wordpress_support_links: searchResults } = await wpcom.req.get( '/help/search', {
				query: search,
				include_post_id: 1,
			} );
			return searchResults;
		},
		{ enabled: !! search, ...queryOptions }
	);

	return inlineHelpQuery;
};

/**
 * Map the collection, populating each result object
 * with the given support type value.
 *
 * @param {Array}   collection   - collection to populate.
 * @param {string}  support_type - Support type to add to each result item.
 * @returns {Array}                Populated collection.
 */
function mapWithSupportTypeProp( collection, support_type ) {
	return collection.map( ( item ) => ( { ...item, support_type } ) );
}

export const withInlineHelpSearchQuery = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const searchQuery = useSelector( getSearchQuery );
		const { data, isLoading } = useInlineHelpSearchQuery( searchQuery );

		const hasApiResults = Array.isArray( data ) && data.length > 0;

		const contextualResults = useSelector( getContextualHelpResults );
		const mappedContextualResults = mapWithSupportTypeProp(
			contextualResults,
			SUPPORT_TYPE_CONTEXTUAL_HELP
		);
		const helpAdminResults = useSelector( ( state ) =>
			getAdminHelpResults( state, searchQuery, 25 )
		);

		const searchResults = hasApiResults
			? [ ...mapWithSupportTypeProp( data, SUPPORT_TYPE_API_HELP ), ...helpAdminResults ]
			: [ ...( isLoading ? [] : mappedContextualResults ), ...helpAdminResults ];

		return (
			<Wrapped
				{ ...props }
				isSearching={ isLoading }
				searchResults={ searchResults }
				hasAPIResults={ hasApiResults }
			/>
		);
	},
	'WithInlineHelpSearchResults'
);

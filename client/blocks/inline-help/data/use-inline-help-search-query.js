import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { useHelpSearchQuery } from 'calypso/data/help/use-help-search-query';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';

export const useInlineHelpSearchQuery = ( search, queryOptions = {} ) =>
	useHelpSearchQuery( search, {
		...queryOptions,
		select( data ) {
			return data.wordpress_support_links ?? [];
		},
	} );

export const withInlineHelpSearchResults = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const searchQuery = useSelector( getSearchQuery );
		const { data, isLoading } = useInlineHelpSearchQuery( searchQuery );

		return <Wrapped { ...props } isSearching={ isLoading } searchResults={ data } />;
	},
	'withInlineHelpSearchResults'
);

import { createHigherOrderComponent } from '@wordpress/compose';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';

export const useInlineHelpSearchQuery = ( search, queryOptions = {} ) =>
	useQuery(
		[ 'inline-help', search ],
		() => wpcom.req.get( '/help/search', { query: search, include_post_id: 1 } ),
		{
			enabled: !! search,
			select( data ) {
				return data.wordpress_support_links ?? [];
			},
			...queryOptions,
		}
	);

export const withInlineHelpSearchResults = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const searchQuery = useSelector( getSearchQuery );
		const { data, isLoading } = useInlineHelpSearchQuery( searchQuery );

		return <Wrapped { ...props } isSearching={ isLoading } searchResults={ data } />;
	},
	'withInlineHelpSearchResults'
);

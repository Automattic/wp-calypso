/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

/**
 * Internal dependencies
 */
import Team from './team';
import useUsers from 'calypso/data/use-users';
import { uniqueBy } from './helpers';

function TeamList( props ) {
	const { site, search } = props;
	const fetchOptions = {
		siteId: site?.ID,
		order: 'ASC',
		order_by: 'display_name',
	};

	if ( search ) {
		fetchOptions.search = `*${ search }*`;
		fetchOptions.search_columns = [ 'display_name', 'user_login' ];
	}

	const { users, total, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useUsers(
		fetchOptions
	);

	/* @TODO: this shouldn't be possible but there are duplicates returned from the API sometimes */
	const uniqueUsers = uniqueBy( users, ( a, b ) => a.ID === b.ID );

	return (
		<Team
			fetchingUsers={ isLoading }
			fetchingNextPage={ isFetchingNextPage }
			totalUsers={ total }
			users={ uniqueUsers }
			excludedUsers={ [] }
			fetchOptions={ fetchOptions }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			{ ...props }
		/>
	);
}

export default localize( ( props ) => (
	<QueryClientProvider client={ queryClient }>
		<TeamList { ...props } />
	</QueryClientProvider>
) );

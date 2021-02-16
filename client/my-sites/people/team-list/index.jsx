/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

/**
 * Internal dependencies
 */
import Team from './team';
import useUsers from 'calypso/data/users/use-users';

function TeamList( props ) {
	const dispatch = useDispatch();
	const { site, search, translate } = props;
	const fetchOptions = {
		siteId: site?.ID,
		order: 'ASC',
		order_by: 'display_name',
	};

	if ( search ) {
		fetchOptions.search = `*${ search }*`;
		fetchOptions.search_columns = [ 'display_name', 'user_login' ];
	}

	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = useUsers( fetchOptions );

	React.useEffect( () => {
		error &&
			dispatch(
				errorNotice( translate( 'There was an error retrieving users' ), {
					id: 'site-users-notice',
					button: 'Try again.',
					onClick: () => {
						dispatch( removeNotice( 'site-users-notice' ) );
						refetch();
					},
				} )
			);
	}, [ dispatch, translate, refetch, error ] );

	return (
		<Team
			fetchingUsers={ isLoading }
			fetchingNextPage={ isFetchingNextPage }
			totalUsers={ data?.total }
			users={ data?.users ?? [] }
			excludedUsers={ [] }
			fetchOptions={ fetchOptions }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			{ ...props }
		/>
	);
}

export default localize( TeamList );

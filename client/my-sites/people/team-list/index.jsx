import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import Team from './team';

const useErrorNotice = ( error, refetch ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( ! error ) {
			return;
		}

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
	}, [ dispatch, translate, error, refetch ] );
};

function TeamList( { site, search } ) {
	const fetchOptions = search
		? {
				search: `*${ search }*`,
				search_columns: [ 'display_name', 'user_login' ],
		  }
		: {};
	const listKey = [ 'team', site.ID, search ].join( '-' );

	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = useUsersQuery( site.ID, fetchOptions );

	useErrorNotice( error, refetch );

	return (
		<Team
			listKey={ listKey }
			fetchingUsers={ isLoading }
			fetchingNextPage={ isFetchingNextPage }
			totalUsers={ data?.total }
			users={ data?.users ?? [] }
			excludedUsers={ [] }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			site={ site }
			search={ search }
		/>
	);
}

TeamList.propTypes = {
	site: PropTypes.object.isRequired,
	search: PropTypes.string,
};

export default TeamList;

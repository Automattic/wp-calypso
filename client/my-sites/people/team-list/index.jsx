/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

/**
 * Internal dependencies
 */
import Team from './team';
import useUsers from 'calypso/data/users/use-users';

const useErrorNotice = ( error, refetch ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
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

function TeamList( props ) {
	const { site, search } = props;
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
	} = useUsers( site.ID, fetchOptions );

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
			{ ...props }
		/>
	);
}

TeamList.propTypes = {
	site: PropTypes.object.isRequired,
	search: PropTypes.string,
};

export default TeamList;

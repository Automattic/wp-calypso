/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Followers from './followers';
import useFollowersQuery from 'calypso/data/followers/use-followers-query';
import useRemoveFollowerMutation from 'calypso/data/followers/use-remove-follower-mutation';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

/**
 * Stylesheet dependencies
 */
import './style.scss';

const useErrorNotice = ( type, error, refetch ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( error ) {
			const notice =
				type === 'email'
					? translate( 'There was an error retrieving email followers' )
					: translate( 'There was an error retrieving followers' );

			dispatch(
				errorNotice( notice, {
					id: 'site-followers-notice',
					button: translate( 'Try again' ),
					onClick: () => {
						dispatch( removeNotice( 'site-followers-notice' ) );
						refetch();
					},
				} )
			);
		}
	}, [ dispatch, error, refetch, translate, type ] );
};

const FollowersList = ( { site, search, type = 'wpcom' } ) => {
	const fetchOptions = { search };
	const listKey = [ 'followers', site.ID, type, search ].join( '-' );

	const {
		data,
		isLoading,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		refetch,
		error,
	} = useFollowersQuery( site.ID, type, fetchOptions );
	const { removeFollower } = useRemoveFollowerMutation();

	useErrorNotice( type, error, refetch );

	return (
		<Followers
			listKey={ listKey }
			followers={ data?.followers ?? [] }
			isFetching={ isLoading }
			isFetchingNextPage={ isFetchingNextPage }
			totalFollowers={ data?.total }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			removeFollower={ removeFollower }
			site={ site }
			currentPage={ 1 }
			type={ type }
			search={ search }
		/>
	);
};

export default FollowersList;

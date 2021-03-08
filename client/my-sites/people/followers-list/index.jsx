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
import useFollowers from 'calypso/data/followers/use-followers';
import useRemoveFollower from 'calypso/data/followers/remove-follower';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

/**
 * Stylesheet dependencies
 */
import './style.scss';

const FollowersList = ( { site, search, type = 'wpcom' } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const fetchOptions = {
		max: 100,
		type,
		search,
	};
	const listKey = [ 'followers', site.ID, type, search ].join( '-' );

	const {
		data,
		isLoading,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		refetch,
		error,
	} = useFollowers( site.ID, fetchOptions );
	const { removeFollower } = useRemoveFollower();

	useEffect( () => {
		if ( error ) {
			const notice =
				type === 'email'
					? translate( 'There was an error retrieving email followers' )
					: translate( 'There was an error retrieving followers' );

			dispatch(
				errorNotice( notice, {
					id: 'site-followers-notice',
					button: 'Try again',
					onClick: () => {
						dispatch( removeNotice( 'site-followers-notice' ) );
						refetch();
					},
				} )
			);
		}
	}, [ dispatch, error, refetch, translate, type ] );

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

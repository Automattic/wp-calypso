/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Followers from './followers';
import useFollowers from 'calypso/data/followers/use-followers';
import useRemoveFollower from 'calypso/data/followers/remove-follower';

/**
 * Stylesheet dependencies
 */
import './style.scss';

const FollowersList = ( { site, search, type = 'wpcom' } ) => {
	const query = {
		max: 100,
		siteId: site.ID,
		type,
		search,
	};

	const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useFollowers( query );
	const { removeFollower } = useRemoveFollower( site.ID, type, search );

	return (
		<Followers
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
			query={ query }
		/>
	);
};

export default FollowersList;

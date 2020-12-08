/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import QueryFollowers from 'calypso/components/data/query-followers';
import Followers from './followers';

/**
 * Stylesheet dependencies
 */
import './style.scss';

const FollowersList = ( { site, search, type = 'wpcom' } ) => {
	const [ currentPage, setCurrentPage ] = useState( 1 );

	const query = {
		max: 100,
		page: currentPage,
		siteId: site.ID,
		type,
		search,
	};

	return (
		<>
			<QueryFollowers query={ query } refresh />
			<Followers
				query={ query }
				site={ site }
				currentPage={ currentPage }
				type={ type }
				incrementPage={ () => setCurrentPage( currentPage + 1 ) }
			/>
		</>
	);
};

export default FollowersList;

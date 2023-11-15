import { useQuery } from '@tanstack/react-query';
import { fetchWordPressVersions } from 'calypso/lib/wporg';
import { MAX_AGE } from 'calypso/state/initial-state';

/**
 * A custom hook that fetches the latest WordPress version and returns it as a query result.
 * @param {number} staleTime - The time in milliseconds that the query should be considered fresh.
 *                             It defaults to MAX_AGE, which is 1 week.
 * @returns {Object} A query result object containing the latest WordPress versions
 *                   in the form of array of versions, e.g. [6.3", "6.2.2", "6.1.3", "6.0.5", "5.9.7"]
 */
export const useLatestWPVersions = ( staleTime = MAX_AGE ) => {
	return useQuery( {
		queryKey: [ 'wordpress-version' ],
		queryFn: fetchWordPressVersions,
		staleTime: staleTime,
		select: ( data ) => data?.offers?.map( ( offer ) => offer.current ),
	} );
};

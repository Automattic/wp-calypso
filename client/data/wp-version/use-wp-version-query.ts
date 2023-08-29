import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { fetchWordPressVersions } from 'calypso/lib/wporg';
import { MAX_AGE } from 'calypso/state/initial-state';

type ResponseWPVersions = { offers: [ { current: string } ] };
type DataWPVersions = string[];

/**
 * A custom hook that fetches the latest WordPress version and returns it as a query result.
 *
 * @param {Object} options - An object containing options for the query.
 * @param {number} options.staleTime - The time in milliseconds that the query should be considered fresh.
 *                                     It defaults to MAX_AGE, which is 1 week.
 * @returns {Object} A query result object containing the latest WordPress versions
 *                   in the form of array of versions, e.g. [6.3", "6.2.2", "6.1.3", "6.0.5", "5.9.7"]
 */
export const useWPVersion = ( {
	staleTime = MAX_AGE,
}: UseQueryOptions = {} ): UseQueryResult< DataWPVersions > => {
	return useQuery( {
		queryKey: [ 'wordpress-version' ],
		queryFn: fetchWordPressVersions,
		staleTime: staleTime,
		select: ( data: ResponseWPVersions ) =>
			data.offers?.slice( 1 ).map( ( offer ) => offer.current ),
	} );
};

import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { fetchWordPressVersions } from 'calypso/lib/wporg';
import { MAX_AGE } from 'calypso/state/initial-state';

type ResponseWPVersions = { offers: [ { current: string } ] };
type DataWPVersions = string[];

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

import { readAchievementsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useYearsOfService( userLogin: string ) {
	const enabled = isEnabled( 'reader/achievements' );
	const query = useInfiniteQuery( {
		...readAchievementsQuery( userLogin ),
		enabled,
	} );

	return {
		yearsOfService: query.data?.pages[ 0 ]?.years_of_service,
		isLoading: enabled && query.isLoading,
	};
}

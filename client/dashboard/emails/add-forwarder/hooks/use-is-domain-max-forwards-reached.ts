import { emailForwardersQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export const useIsDomainMaxForwardsReached = ( domain: string ) => {
	const { data, isLoading } = useQuery( emailForwardersQuery( domain ) );

	if ( ! data ) {
		return { isLoading, isReached: false, maxForwards: undefined };
	}

	const { forwards, max_forwards } = data;

	return { isLoading, isReached: forwards.length >= max_forwards, maxForwards: max_forwards };
};

import { emailForwardersQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export const useIsDomainMaxForwardsReached = ( domain: string ) => {
	const { data } = useQuery( emailForwardersQuery( domain ) );

	if ( ! data ) {
		return { isReached: false, maxForwards: undefined };
	}

	const { forwards, max_forwards } = data;

	return { isReached: forwards.length >= max_forwards, maxForwards: max_forwards };
};

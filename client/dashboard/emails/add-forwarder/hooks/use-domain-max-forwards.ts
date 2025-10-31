import { emailForwardersQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export const DEFAULT_MAX_DOMAIN_FORWARDS = 100;

export const useDomainMaxForwards = ( domain: string ) => {
	const { data, isLoading } = useQuery( { ...emailForwardersQuery( domain ), enabled: !! domain } );

	if ( ! data ) {
		return { isLoading, forwards: [], maxForwards: DEFAULT_MAX_DOMAIN_FORWARDS };
	}

	const { forwards, max_forwards } = data;

	return { isLoading, forwards, maxForwards: max_forwards };
};

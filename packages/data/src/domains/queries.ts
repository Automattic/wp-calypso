import { useQuery } from '@tanstack/react-query';
import { DomainTransferStatus } from './types';

export const useDomainTransferStatus = () => {
	const { data, isLoading, error } = useQuery( {
		queryKey: [ 'domain-transfer-status__random-value' ],
		queryFn: () => Promise.resolve( DomainTransferStatus.RANDOM_VALUE ),
	} );

	return { data, isLoading, error };
};

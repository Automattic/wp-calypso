import { mutationOptions } from '@tanstack/react-query';
import { requestTransferCode, updateDomainLock } from '../../data/domain-transfer';
import { queryClient } from '../query-client';
import { domainQuery } from './domain';

export const domainLockMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDomainLock( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( domainQuery( domain ) );
		},
	} );

export const domainTransferCodeMutation = ( domain: string ) =>
	mutationOptions( {
		mutationFn: () => requestTransferCode( domain ),
	} );

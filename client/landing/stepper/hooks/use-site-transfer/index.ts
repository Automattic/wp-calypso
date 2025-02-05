import { UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSiteTransferMutation } from './mutation';
import { useSiteTransferStatusQuery } from './query';

type Status = 'idle' | 'pending' | 'success' | 'error';
type Options = Pick< UseQueryOptions, 'retry' > & { from?: string };

/**
 * Hook to initiate a site transfer and monitor its progress
 */
export const useSiteTransfer = ( siteId?: number, options?: Options ) => {
	const {
		mutate: startTransfer,
		status: startTransferStatus,
		error: startTransferError,
	} = useSiteTransferMutation( siteId, options );

	const {
		data,
		error: statusError,
		fetchStatus: transferFetchStatus,
	} = useSiteTransferStatusQuery( siteId, options );
	const { isReadyToTransfer = false, completed = false, isTransferring } = data || {};

	const isNotStarting = startTransferStatus === 'idle';
	const shouldStartTransfer = isReadyToTransfer && isNotStarting;
	const error = statusError || startTransferError;

	useEffect( () => {
		if ( shouldStartTransfer ) {
			startTransfer();
		}
	}, [ shouldStartTransfer, startTransfer ] );

	const getStatus = (): Status => {
		if ( completed ) {
			return 'success';
		}

		if ( isTransferring || isReadyToTransfer || transferFetchStatus === 'fetching' ) {
			return 'pending';
		}

		if ( error ) {
			return 'error';
		}

		return 'idle';
	};

	return {
		completed,
		status: getStatus(),
		error: statusError || startTransferError || null,
	};
};

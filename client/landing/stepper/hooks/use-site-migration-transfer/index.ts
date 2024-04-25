import { useEffect } from 'react';
import { useSiteTransferMutation } from './mutation';
import { useSiteTransferStatusQuery } from './query';

/**
 * Hook to to initiate a site transfer and monitor its progress
 */
export const useSiteMigrationTransfer = ( siteId?: number ) => {
	const {
		mutate: startTransfer,
		status: startTransferStatus,
		error: startTransferError,
	} = useSiteTransferMutation( siteId );

	const { data, error: statusError } = useSiteTransferStatusQuery( siteId );
	const { status: transferStatus, isReadyToTransfer, completed, isTransferring } = data || {};
	const isNotStarting = startTransferStatus === 'idle';
	const shouldStartTransfer = isReadyToTransfer && isNotStarting;

	useEffect( () => {
		if ( shouldStartTransfer ) {
			startTransfer();
		}
	}, [ shouldStartTransfer, startTransfer ] );

	return {
		completed,
		isTransferring,
		status: transferStatus,
		error: statusError || startTransferError || null,
	};
};

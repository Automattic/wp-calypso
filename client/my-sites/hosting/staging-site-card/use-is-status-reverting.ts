import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { transferStates } from 'calypso/state/automated-transfer/constants';

export function useIsStatusReverting(
	transferStatus: string | null,
	onReverted?: () => void
): boolean {
	const [ isStatusReverting, setIsStatusReverting ] = useState( false );
	const queryClient = useQueryClient();

	useEffect( () => {
		switch ( transferStatus ) {
			case transferStates.REVERTED:
			case transferStates.REQUEST_FAILURE:
				onReverted?.();
				break;
			case null:
				setIsStatusReverting( false );
				break;
			case transferStates.RELOCATING_REVERT:
				setIsStatusReverting( true );
				break;
		}
	}, [ onReverted, queryClient, transferStatus ] );

	return isStatusReverting;
}

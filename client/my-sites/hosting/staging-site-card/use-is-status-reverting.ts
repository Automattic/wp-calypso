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
			case transferStates.REQUEST_FAILURE:
			case null:
				if ( isStatusReverting ) {
					onReverted?.();
					setIsStatusReverting( false );
				}
				break;
			case transferStates.REVERTED:
			case transferStates.RELOCATING_REVERT:
				setIsStatusReverting( true );
				break;
		}
	}, [ isStatusReverting, onReverted, queryClient, transferStatus ] );

	return isStatusReverting;
}

import { useEffect, useState } from 'react';
import { transferStates } from 'calypso/state/automated-transfer/constants';

export function useIsStatusReverting(
	transferStatus: string | null,
	onReverted?: () => void
): boolean {
	const [ isStatusReverting, setIsStatusReverting ] = useState( false );
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
	}, [ isStatusReverting, onReverted, transferStatus ] );

	return isStatusReverting;
}

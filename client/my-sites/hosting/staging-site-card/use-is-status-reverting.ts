import { useEffect, useState } from 'react';
import { transferStates } from 'calypso/state/automated-transfer/constants';

export function useIsStatusReverting( transferStatus: string | null ): boolean {
	const [ isStatusReverting, setIsStatusReverting ] = useState( false );
	useEffect( () => {
		switch ( transferStatus ) {
			case transferStates.REQUEST_FAILURE:
			case transferStates.REVERTED:
			case transferStates.COMPLETE:
			case null:
				if ( isStatusReverting ) {
					setIsStatusReverting( false );
				}
				break;
			case transferStates.RELOCATING_REVERT:
				setIsStatusReverting( true );
				break;
		}
	}, [ isStatusReverting, transferStatus ] );

	return isStatusReverting;
}

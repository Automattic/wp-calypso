import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

export function useIsReverting( transferStatus: string | null ): {
	isReverting: boolean;
	setIsReverting: ( value: boolean ) => void;
} {
	const [ isReverting, setIsReverting ] = useState( false );
	const queryClient = useQueryClient();

	useEffect( () => {
		switch ( transferStatus ) {
			case transferStates.REVERTED:
			case transferStates.REQUEST_FAILURE:
				queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY ] );
				break;
			case null:
				setIsReverting( false );
				break;
			case transferStates.RELOCATING_REVERT:
				setIsReverting( true );
				break;
		}
	}, [ queryClient, transferStatus ] );

	return { isReverting, setIsReverting };
}

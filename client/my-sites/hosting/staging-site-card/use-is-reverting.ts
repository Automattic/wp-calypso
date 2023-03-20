import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { USE_STAGING_SITE_QUERY_KEY } from './use-staging-site';

export function useIsReverting( transferStatus: string | null ): boolean {
	const [ isReverting, setIsReverting ] = useState( false );
	const queryClient = useQueryClient();

	useEffect( () => {
		switch ( transferStatus ) {
			case 'request_failure':
				queryClient.invalidateQueries( [ USE_STAGING_SITE_QUERY_KEY ] );
				break;
			case 'reverted':
			case null:
				setIsReverting( false );
				break;
			case 'relocating_revert':
				setIsReverting( true );
				break;
		}
	}, [ queryClient, transferStatus ] );

	return isReverting;
}

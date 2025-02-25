import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { resetBreadcrumbs } from 'calypso/state/breadcrumb/actions';

export function useInitializeBreadcrumbs( siteId: number | undefined ) {
	const dispatch = useDispatch();
	useEffect( () => {
		if ( ! siteId ) {
			dispatch( resetBreadcrumbs() );
		}
	}, [ siteId, dispatch ] );
}

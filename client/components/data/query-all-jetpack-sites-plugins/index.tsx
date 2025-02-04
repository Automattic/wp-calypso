import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { fetchAllPlugins } from 'calypso/state/plugins/installed/actions';
import { isRequestingForAllSites } from 'calypso/state/plugins/installed/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

const request = () => ( dispatch: CalypsoDispatch, getState: AppState ) => {
	if ( ! isRequestingForAllSites( getState() ) ) {
		dispatch( fetchAllPlugins() );
	}
};

export default function QueryAllJetpackSitesPlugins() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request() );
	}, [ dispatch ] );

	return null;
}

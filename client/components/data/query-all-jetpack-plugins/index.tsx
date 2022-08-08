import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllPlugins } from 'calypso/state/plugins/installed/actions';
import { isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

interface Props {
	siteIds: number[];
}

const request = ( siteIds: number[] ) => ( dispatch: CalypsoDispatch, getState: AppState ) => {
	if ( ! isRequestingForSites( getState(), siteIds ) ) {
		dispatch( fetchAllPlugins( siteIds ) );
	}
};

export default function QueryAllJetpackPlugins( { siteIds }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteIds ) );
	}, [ dispatch, siteIds ] );

	return null;
}

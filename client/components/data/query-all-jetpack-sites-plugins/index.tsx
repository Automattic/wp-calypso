import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { PLUGINS_ALL_REQUEST_SUCCESS } from 'calypso/state/action-types';
import {
	fetchAllPlugins,
	fetchBatchPlugins,
	receiveAllSitesPlugins,
} from 'calypso/state/plugins/installed/actions';
import { isRequestingForAllSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
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

const requestBatches =
	( batches: number[][] ) => async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		if ( ! isRequestingForAllSites( getState() ) ) {
			const fetchPromises = batches.map( ( batch ) => dispatch( fetchBatchPlugins( batch ) ) );
			const sites = await Promise.all( fetchPromises );

			dispatch( { type: PLUGINS_ALL_REQUEST_SUCCESS } );
			const allSites = Object.assign( {}, ...sites.map( ( obj: { sites: [] } ) => obj.sites ) );
			dispatch( receiveAllSitesPlugins( allSites ) );
		}
	};

export function QueryBatchJetpackSitesPlugins( { batchSize = 500 }: { batchSize?: number } ) {
	const dispatch = useDispatch();
	const siteIds = useSelector( ( state ) => getSites( state ) )
		.filter( ( site ) => site?.is_wpcom_atomic )
		.map( ( site ) => site?.ID )
		.filter( ( id ): id is number => id !== undefined );

	const batches = useMemo( () => {
		const result: number[][] = [];
		for ( let i = 0; i < siteIds.length; i += batchSize ) {
			result.push( siteIds?.slice( i, i + batchSize ) );
		}
		return result;
	}, [ batchSize ] );

	useEffect( () => {
		if ( batches.length === 0 ) {
			return;
		}
		dispatch( requestBatches( batches ) );
	}, [ dispatch, batches ] );

	return null;
}

import { withStorageKey } from '@automattic/state-utils';
import wpcom from 'calypso/lib/wp';
import { ATOMIC_SOFTWARE_INSTALL, ATOMIC_SOFTWARE_STATUS } from 'calypso/state/action-types';
import { registerReducer } from 'calypso/state/redux-store';
import { keyedReducer } from 'calypso/state/utils';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

export interface AtomicSoftwareStatus {
	blog_id: number;
	software_set: Record< string, { path: string; state: string } >;
	applied: boolean;
}

interface AtomicSoftwareError {
	message: string;
}

interface AtomicSoftwareInstallResponse {
	job_id: number;
}

export const installSoftware = ( siteId: number, softwareSet: string ) => (
	dispatch: ( action: AnyAction ) => void
) =>
	wpcom.req
		.post( {
			path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
			apiNamespace: 'wpcom/v2',
		} )
		.then(
			( status: { status: AtomicSoftwareInstallResponse } ) =>
				dispatch( { type: ATOMIC_SOFTWARE_INSTALL, siteId, status, softwareSet } ),
			( error: { error: AtomicSoftwareError } ) =>
				dispatch( { type: ATOMIC_SOFTWARE_INSTALL, siteId, error, softwareSet } )
		);

export const fetchSoftwareStatus = ( siteId: number, softwareSet: string ) => (
	dispatch: ( action: AnyAction ) => void
) =>
	wpcom.req
		.get( {
			path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
			apiNamespace: 'wpcom/v2',
		} )
		.then(
			( status: { status: AtomicSoftwareStatus } ) =>
				dispatch( { type: ATOMIC_SOFTWARE_STATUS, siteId, status, softwareSet } ),
			( error: { error: AtomicSoftwareError } ) =>
				dispatch( { type: ATOMIC_SOFTWARE_STATUS, siteId, error, softwareSet } )
		);

function software( state = {}, action: AnyAction ) {
	switch ( action.type ) {
		case ATOMIC_SOFTWARE_INSTALL:
			console.log( action );
			return action;
		case ATOMIC_SOFTWARE_STATUS:
			console.log( action );
			return action;
	}
	return state;
}

const softwareReducer = withStorageKey(
	'atomicSoftware',
	keyedReducer( 'type', keyedReducer( 'siteId', keyedReducer( 'softwareSet', software ) ) )
);

registerReducer( [ 'atomicSoftware' ], softwareReducer );

export const getSoftwareStatus = (
	state: AppState,
	siteId: number,
	softwareSet: string
): {
	siteId: number & ( { status: AtomicSoftwareStatus } | { error: AtomicSoftwareError } );
} | null => state?.atomicSoftware?.[ ATOMIC_SOFTWARE_STATUS ]?.[ siteId ]?.[ softwareSet ] || null;

export const getSoftwareInstallResponse = (
	state: AppState,
	siteId: number,
	softwareSet: string
): {
	siteId: number & ( { response: AtomicSoftwareInstallResponse } | { error: AtomicSoftwareError } );
} | null => state?.atomicSoftware?.[ ATOMIC_SOFTWARE_INSTALL ]?.[ siteId ]?.[ softwareSet ] || null;

import { withStorageKey } from '@automattic/state-utils';
import wpcom from 'calypso/lib/wp';
import { ATOMIC_TRANSFER_INITIATE, ATOMIC_TRANSFER_LATEST } from 'calypso/state/action-types';
import { registerReducer } from 'calypso/state/redux-store';
import { keyedReducer } from 'calypso/state/utils';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

export const transferStates = {
	PENDING: 'pending',
	ACTIVE: 'active',
	PROVISIONED: 'provisioned',
	COMPLETED: 'completed',
	ERROR: 'error',
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	RELOCATING_SWITCHEROO: 'relocating_switcheroo',
	REVERTING: 'reverting',
	RENAMING: 'renaming',
	EXPORTING: 'exporting',
	IMPORTING: 'importing',
	CLEANUP: 'cleanup',
} as const;

interface AtomicTransferRecord {
	atomic_transfer_id: number;
	blog_id: number;
	status: string;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}

interface AtomicTransferError {
	error: string;
}

export const initiateTransfer = ( siteId: number, { softwareSet }: { softwareSet?: string } ) => (
	dispatch: ( action: AnyAction ) => void
) =>
	wpcom.req
		.post(
			{ path: `/sites/${ siteId }/atomic/transfers/`, apiNamespace: 'wpcom/v2' },
			{
				...( softwareSet
					? {
							software_set: softwareSet,
					  }
					: {} ),
			}
		)
		.then(
			( transfer: { transfer: AtomicTransferRecord } ) =>
				dispatch( { type: ATOMIC_TRANSFER_INITIATE, siteId, transfer } ),
			( error: { error: AtomicTransferError } ) =>
				dispatch( { type: ATOMIC_TRANSFER_INITIATE, siteId, error } )
		);

export const fetchLatestTransfer = ( siteId: number ) => (
	dispatch: ( action: AnyAction ) => void
) =>
	wpcom.req
		.get( {
			path: `/sites/${ siteId }/atomic/transfers/latest`,
			apiNamespace: 'wpcom/v2',
		} )
		.then(
			( transfer: { transfer: AtomicTransferRecord } ) =>
				dispatch( { type: ATOMIC_TRANSFER_LATEST, siteId, transfer } ),
			( error: { error: AtomicTransferError } ) =>
				dispatch( { type: ATOMIC_TRANSFER_LATEST, siteId, error } )
		);

function transfers( state = {}, action: AnyAction ) {
	switch ( action.type ) {
		case ATOMIC_TRANSFER_INITIATE:
			console.log( action );
			return action;
		case ATOMIC_TRANSFER_LATEST:
			console.log( action );
			return action;
	}

	return state;
}

export const transfersReducer = withStorageKey(
	'atomicTransfers',
	keyedReducer( 'type', keyedReducer( 'siteId', transfers ) )
);

registerReducer( [ 'atomicTransfers' ], transfersReducer );

export const getLatestTransfer = (
	state: AppState,
	siteId: number
): { siteId: number & ( AtomicTransferRecord | AtomicTransferError ) } | null =>
	state?.atomicTransfers?.[ ATOMIC_TRANSFER_LATEST ]?.[ siteId ] || null;

export const getInitiateTransferResponse = (
	state: AppState,
	siteId: number
): { siteId: number & ( AtomicTransferRecord | AtomicTransferError ) } | null =>
	state?.atomicTransfers?.[ ATOMIC_TRANSFER_INITIATE ]?.[ siteId ] || null;

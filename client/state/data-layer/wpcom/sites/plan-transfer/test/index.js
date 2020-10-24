/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { handleTransferError, handleTransferSuccess, requestPlanOwnershipTransfer } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { transferPlanOwnership } from 'calypso/state/sites/plans/actions';

const siteId = 2916284;

describe( 'requestPlanOwnershipTransfer()', () => {
	test( 'should return an action for HTTP request to transfer the site plan to another user', () => {
		const newOwnerUserId = 12345678;
		const action = transferPlanOwnership( siteId, newOwnerUserId );
		const result = requestPlanOwnershipTransfer( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1',
					method: 'POST',
					path: '/sites/' + action.siteId + '/plan-transfer',
					query: {
						new_user_id: action.newOwnerUserId,
					},
				},
				action
			)
		);
	} );
} );

describe( 'handleTransferSuccess()', () => {
	test( 'should return a success notice action and a function', () => {
		const actions = handleTransferSuccess( { siteId } );

		expect( actions ).toHaveLength( 2 );
		expect( actions[ 0 ] ).toMatchObject(
			successNotice( 'Plan purchaser has been changed successfully.', {
				duration: 8000,
				id: `sites-plan-transfer-notice-${ siteId }`,
			} )
		);
		expect( actions[ 1 ] ).toBeInstanceOf( Function );
	} );
} );

describe( 'handleTransferError()', () => {
	test( 'should return an error notice action', () => {
		const message = 'Transferring plans is not allowed for this site.';
		const action = handleTransferError( { siteId }, { message } );

		expect( action ).toMatchObject(
			errorNotice( message, {
				duration: 8000,
				id: `sites-plan-transfer-notice-${ siteId }`,
			} )
		);
	} );
} );

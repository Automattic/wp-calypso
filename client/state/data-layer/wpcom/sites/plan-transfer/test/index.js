/** @format */

/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'state/notices/actions';
import { handleTransferError, handleTransferSuccess, requestPlanOwnershipTransfer } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { transferPlanOwnership } from 'state/sites/plans/actions';

const siteId = 2916284;

describe( 'requestPlanOwnershipTransfer()', () => {
	test( 'should return an action for HTTP request to transfer the site plan to another user', () => {
		const newUserId = 12345678;
		const action = transferPlanOwnership( siteId, newUserId );
		const result = requestPlanOwnershipTransfer( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1',
					method: 'POST',
					path: '/sites/' + action.siteId + '/plan-transfer',
					query: {
						new_user_id: action.newUserId,
					},
				},
				action
			)
		);
	} );
} );

describe( 'handleTransferSuccess()', () => {
	test( 'should return a success notice action', () => {
		const action = handleTransferSuccess( { siteId } );

		expect( action ).toMatchObject(
			successNotice( 'Plan purchaser has been changed successfully.', {
				duration: 8000,
				id: `sites-plan-transfer-notice-${ siteId }`,
			} )
		);
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

import { receiveAdminSidebarLayout } from 'calypso/state/admin-sidebar/layout/actions';
import { saveLayout } from '../save-flow';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';

jest.mock( 'calypso/state/admin-sidebar/layout/actions', () => ( {
	receiveAdminSidebarLayout: jest.fn( ( siteId, delta ) => ( {
		type: 'ADMIN_SIDEBAR_LAYOUT_RECEIVE',
		siteId,
		delta,
	} ) ),
} ) );

const sampleDelta: LayoutDelta = {
	version: 1,
	updated_at: 0,
	overrides: [
		{
			itemId: 'plugin:foo:-:foo.php',
			position: { kind: 'in_group', group_id: 'plugins', index: 0 },
		},
	],
};

describe( 'customize save-flow', () => {
	beforeEach( () => {
		( receiveAdminSidebarLayout as jest.Mock ).mockClear();
	} );

	it( 'POSTs the working delta and dispatches the persisted delta on success', async () => {
		const persisted: LayoutDelta = { ...sampleDelta, updated_at: 12345 };
		const requestImpl = jest.fn().mockResolvedValue( persisted );
		const dispatch = jest.fn();
		const result = await saveLayout( dispatch, {
			siteId: 12345,
			delta: sampleDelta,
			requestImpl,
		} );
		expect( requestImpl ).toHaveBeenCalledWith( {
			path: '/sites/12345/wp-admin-sidebar/layout',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: sampleDelta,
		} );
		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'ADMIN_SIDEBAR_LAYOUT_RECEIVE',
			siteId: 12345,
			delta: persisted,
		} );
		expect( result ).toBe( persisted );
	} );

	it( 'rethrows with the server error message on failure', async () => {
		const requestImpl = jest.fn().mockRejectedValue( {
			message: 'overrides exceeds the maximum of 64.',
		} );
		const dispatch = jest.fn();
		await expect(
			saveLayout( dispatch, { siteId: 12345, delta: sampleDelta, requestImpl } )
		).rejects.toThrow( 'overrides exceeds the maximum of 64.' );
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'rejects with a malformed-response error when the body is not a delta', async () => {
		const requestImpl = jest.fn().mockResolvedValue( null );
		const dispatch = jest.fn();
		await expect(
			saveLayout( dispatch, { siteId: 12345, delta: sampleDelta, requestImpl } )
		).rejects.toThrow( /malformed/ );
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'falls back to a generic message when the rejected error has no message', async () => {
		const requestImpl = jest.fn().mockRejectedValue( {} );
		const dispatch = jest.fn();
		await expect(
			saveLayout( dispatch, { siteId: 12345, delta: sampleDelta, requestImpl } )
		).rejects.toThrow( 'Save failed.' );
	} );
} );

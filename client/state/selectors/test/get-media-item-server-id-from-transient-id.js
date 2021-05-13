/**
 * Internal dependencies
 */
import getMediaItemServerIdFromTransientId from 'calypso/state/selectors/get-media-item-server-id-from-transient-id';

describe( 'getMediaItemServerIdFromTransientId()', () => {
	const siteId = 443234;
	const transientId = 1;
	const serverId = Symbol( 'server id' );
	const state = {
		media: {
			transientItems: {
				[ siteId ]: {
					transientIdsToServerIds: {
						[ transientId ]: serverId,
					},
				},
			},
		},
	};

	it( 'should return the server id for the passed in transient ID', () => {
		expect( getMediaItemServerIdFromTransientId( state, siteId, transientId ) ).toBe( serverId );
	} );

	describe( 'null safety', () => {
		const nullObjects = [
			{ media: { transientItems: { [ siteId ]: { transientIdsToServerIds: {} } } } },
			{ media: { transientItems: { [ siteId ]: {} } } },
			{ media: { transientItems: {} } },
			{ media: {} },
			{},
		];

		it.each( nullObjects )( 'should be null safe for %s', ( nullState ) => {
			expect( getMediaItemServerIdFromTransientId( nullState, siteId ) ).toBeUndefined();
		} );

		it( 'should be null safe when the site is not present', () => {
			expect( getMediaItemServerIdFromTransientId( state, 'not a site ID' ) ).toBeUndefined();
		} );
	} );
} );

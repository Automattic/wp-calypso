/**
 * Internal dependencies
 */
import getTransientMediaItem from 'calypso/state/selectors/get-transient-media-item';

describe( 'getTransientMediaItem()', () => {
	const siteId = 443234;
	const transientId = 1;
	const transientMediaItem = Symbol( 'transient media item' );
	const state = {
		media: {
			transientItems: {
				[ siteId ]: {
					transientItems: {
						[ transientId ]: transientMediaItem,
					},
				},
			},
		},
	};

	it( 'should return the transient media item corresponding to the passed in ID', () => {
		expect( getTransientMediaItem( state, siteId, transientId ) ).toBe( transientMediaItem );
	} );

	describe( 'null safety', () => {
		const nullObjects = [
			{ media: { transientItems: { [ siteId ]: { transientItems: {} } } } },
			{ media: { transientItems: { [ siteId ]: {} } } },
			{ media: { transientItems: {} } },
			{ media: {} },
			{},
		];

		it.each( nullObjects )( 'should be null safe for %s', ( nullState ) => {
			expect( getTransientMediaItem( nullState, siteId ) ).toBeUndefined();
		} );

		it( 'should be null safe when the site is not present', () => {
			expect( getTransientMediaItem( state, 'not a site ID' ) ).toBeUndefined();
		} );
	} );
} );

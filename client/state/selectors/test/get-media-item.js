/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMediaItem from 'calypso/state/selectors/get-media-item';
import MediaQueryManager from 'calypso/lib/query-manager/media';

describe( 'getMediaItem()', () => {
	const siteId = 2916284;
	const item = {
		ID: 42,
		title: 'flowers',
		URL: 'https://hello.com',
	};

	const state = {
		media: {
			queries: {
				[ siteId ]: new MediaQueryManager( {
					items: {
						42: item,
					},
				} ),
			},
		},
	};

	test( 'should return null if the site is not in state', () => {
		expect( getMediaItem( state, 2916285, 42 ) ).to.be.null;
	} );

	test( 'should return null if the media for the site is not in state', () => {
		expect( getMediaItem( state, 2916284, 43 ) ).to.be.null;
	} );

	test( 'should return the media item', () => {
		expect( getMediaItem( state, 2916284, 42 ) ).to.eql( item );
	} );

	describe( 'transient media', () => {
		const transientItem = {
			ID: 'transient-id-1',
			title: 'transient flowers',
			URL: 'http://example.com',
		};

		// represents the state before a transient media item has been promoted
		const transientStatePreSave = {
			media: {
				...state.media,
				transientItems: {
					[ siteId ]: {
						transientItems: {
							[ transientItem.ID ]: transientItem,
						},
						transientIdsToServerIds: {},
					},
				},
			},
		};

		// represents the state after a transient media item has been promoted
		const transientStatePostSave = {
			media: {
				...state.media,
				transientItems: {
					[ siteId ]: {
						transientItems: {},
						transientIdsToServerIds: {
							[ transientItem.ID ]: item.ID,
						},
					},
				},
			},
		};

		describe( 'before promotion', () => {
			test( 'should return the transient media item', () => {
				const result = getMediaItem( transientStatePreSave, siteId, transientItem.ID );
				expect( result ).to.eql( transientItem );
			} );
		} );

		describe( 'after promotion', () => {
			test( 'should return the actual media item when given the transient ID', () => {
				const result = getMediaItem( transientStatePostSave, siteId, transientItem.ID );
				expect( result ).to.eql( item );
			} );

			test( 'should return the actual media item when given the server ID', () => {
				const result = getMediaItem( transientStatePostSave, siteId, item.ID );
				expect( result ).to.eql( item );
			} );
		} );
	} );
} );

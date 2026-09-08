import deepFreeze from 'deep-freeze';
import MediaQueryManager from 'calypso/lib/query-manager/media';
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { createMediaItem, failMediaItemRequest, receiveMedia, setNextPageHandle } from '../actions';
import reducer, { queries, transientItems, fetching } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'queries', 'transientItems', 'fetching' ] )
		);
	} );

	describe( 'queries()', () => {
		const items = [
			{
				ID: 42,
				title: 'flowers',
			},
		];

		const query1 = {
			search: 'flower',
		};

		const query2 = {
			search: 'flowers',
		};

		const action1 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query1,
		};

		const action2 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query2,
		};

		test( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track media receive', () => {
			const state = queries( deepFreeze( {} ), action1 );

			expect( Object.keys( state ) ).toContain( '2916284' );
			expect( state[ 2916284 ] ).toBeInstanceOf( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).toEqual( items );
		} );

		test( 'should accumulate query requests', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action2 );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( state[ 2916284 ] ).toBeInstanceOf( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).toHaveLength( 1 );
			expect( state[ 2916284 ].getItems( query2 ) ).toHaveLength( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action1 );

			expect( state ).toEqual( previousState );
		} );

		test( 'should track posts even if not associated with a query', () => {
			const state = queries( deepFreeze( {} ), {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				media: items,
			} );

			expect( Object.keys( state ) ).toEqual( expect.arrayContaining( [ '2916284' ] ) );
			expect( state[ 2916284 ] ).toBeInstanceOf( MediaQueryManager );
			expect( state[ 2916284 ].getItems() ).toEqual( items );
		} );

		test( 'should update received posts', () => {
			const updatedItem = {
				ID: 42,
				title: 'test',
			};

			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				...action1,
				media: [ updatedItem ],
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).toEqual( updatedItem );
		} );

		test( 'should remove item when post delete action success dispatched', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).toBeUndefined();
			expect( state[ 2916284 ].getItems() ).toHaveLength( 0 );
		} );
	} );

	describe( 'transientItems()', () => {
		const siteId = 2916284;
		const site = {
			ID: siteId,
		};
		const anotherSiteId = 87654321;
		const mediaId = 42;
		const transientMediaId = 'media-32';
		const transientMediaItem = {
			ID: transientMediaId,
		};
		const serverMediaItem = {
			ID: mediaId,
		};
		const justSavedMediaItem = {
			ID: mediaId,
			transientId: transientMediaId,
		};
		const baseState = deepFreeze( {} );

		describe( 'MEDIA_ITEM_CREATE', () => {
			const action = createMediaItem( site, transientMediaItem );

			test( 'should add the transient item to the map of transient items for the site', () => {
				const result = transientItems( baseState, action );

				expect( result ).toEqual( {
					[ action.site.ID ]: {
						transientItems: {
							[ transientMediaItem.ID ]: transientMediaItem,
						},
						transientIdsToServerIds: {},
					},
				} );
			} );

			test( 'should preserve existing transient media items', () => {
				const anotherTransientMediaItem = {
					ID: 'another-transient-media-123',
				};
				const result = transientItems(
					{
						[ action.site.ID ]: {
							transientItems: {
								[ anotherTransientMediaItem.ID ]: anotherTransientMediaItem,
							},
						},
					},
					action
				);

				expect( result ).toEqual( {
					[ action.site.ID ]: {
						transientItems: {
							[ anotherTransientMediaItem.ID ]: anotherTransientMediaItem,
							[ action.transientMedia.ID ]: action.transientMedia,
						},
						transientIdsToServerIds: {},
					},
				} );
			} );

			test( 'should leave transientIdsToServerIds alone', () => {
				const transientIdsToServerIds = Symbol( 'transient ids to server ids' );
				const result = transientItems(
					{
						[ action.site.ID ]: {
							transientIdsToServerIds,
						},
					},
					action
				);

				expect( result ).toEqual( {
					[ action.site.ID ]: {
						transientItems: {
							[ action.transientMedia.ID ]: action.transientMedia,
						},
						transientIdsToServerIds,
					},
				} );
			} );
		} );

		describe( 'MEDIA_RECEIVE', () => {
			test( 'should do nothing and ignore media that does not have a `transientId` property', () => {
				const action = receiveMedia( siteId, serverMediaItem );
				const result = transientItems( {}, action );

				expect( result ).toEqual( {} );
			} );

			test( 'should remove the transient item and create a mapping of transient id -> server id', () => {
				const action = receiveMedia( siteId, justSavedMediaItem );
				const result = transientItems(
					{
						[ siteId ]: {
							transientItems: { [ justSavedMediaItem.transientId ]: transientMediaItem },
						},
					},
					action
				);

				expect( result ).toEqual( {
					[ siteId ]: {
						transientItems: {},
						transientIdsToServerIds: { [ justSavedMediaItem.transientId ]: justSavedMediaItem.ID },
					},
				} );
			} );

			test( 'should leave unrelated mappings, transient items and sites alone', () => {
				const anotherSiteState = Symbol( 'another site state' );
				const otherTransientItem = {
					ID: 'other transient item',
				};
				const existingMappings = {
					'previously-transient-media': 1234442,
				};
				const action = receiveMedia( siteId, justSavedMediaItem );

				const state = {
					[ anotherSiteId ]: anotherSiteState,
					[ siteId ]: {
						transientItems: {
							[ otherTransientItem.ID ]: otherTransientItem,
							[ justSavedMediaItem.transientId ]: justSavedMediaItem,
						},
						transientIdsToServerIds: existingMappings,
					},
				};

				const result = transientItems( state, action );

				expect( result ).toEqual( {
					[ anotherSiteId ]: anotherSiteState,
					[ siteId ]: {
						transientItems: {
							[ otherTransientItem.ID ]: otherTransientItem,
						},
						transientIdsToServerIds: {
							...existingMappings,
							[ justSavedMediaItem.transientId ]: justSavedMediaItem.ID,
						},
					},
				} );
			} );
		} );

		describe( 'MEDIA_ITEM_REQUEST_FAILURE', () => {
			const action = failMediaItemRequest( siteId, transientMediaId );

			test( 'should clear the transient item for the failed upload', () => {
				const state = {
					[ siteId ]: {
						transientItems: {
							[ transientMediaId ]: transientMediaItem,
						},
					},
				};

				const result = transientItems( state, action );

				expect( result ).toEqual( {
					[ siteId ]: {
						transientItems: {},
						transientIdsToServerIds: {},
					},
				} );
			} );

			test( 'should do nothing if the transient Id does not exist', () => {
				const state = {
					[ siteId ]: {
						transientItems: {
							'a-different-media-123': transientMediaItem,
						},
					},
				};

				const result = transientItems( state, action );

				expect( result ).toEqual( {
					[ siteId ]: {
						transientItems: {
							'a-different-media-123': transientMediaItem,
						},
						transientIdsToServerIds: {},
					},
				} );
			} );
		} );
	} );

	describe( 'fetching()', () => {
		const state1 = {
			2916284: {
				items: {
					[ 10 ]: true,
				},
			},
		};

		const state2 = {
			2916284: {
				nextPage: false,
			},
		};

		const state3 = {
			2916284: {
				nextPage: true,
			},
		};

		test( 'should default to an empty object', () => {
			const state = fetching( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track media request', () => {
			const state = fetching( deepFreeze( state2 ), {
				type: MEDIA_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).toEqual( state3 );
		} );

		test( 'should track media request success', () => {
			const state = fetching( deepFreeze( state3 ), {
				type: MEDIA_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).toEqual( state2 );
		} );

		test( 'should track media request failures', () => {
			const state = fetching( deepFreeze( state3 ), {
				type: MEDIA_REQUEST_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( state2 );
		} );

		test( 'should set the next page handle', () => {
			const nextPage = Symbol( 'next page handle' );
			const state = fetching(
				deepFreeze( state1 ),
				setNextPageHandle( 2916284, { next_page: nextPage } )
			);

			expect( state ).toEqual( {
				2916284: {
					...state[ 2916284 ],
					nextPageHandle: nextPage,
				},
			} );
		} );
	} );
} );

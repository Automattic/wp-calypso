import deepFreeze from 'deep-freeze';
import { ValidationErrors as MediaValidationErrors } from 'calypso/lib/media/constants';
import MediaQueryManager from 'calypso/lib/query-manager/media';
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import {
	changeMediaSource,
	clearMediaErrors,
	clearMediaItemErrors,
	createMediaItem,
	deleteMedia,
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	setMediaItemErrors,
	setNextPageHandle,
	selectMediaItems,
	successMediaItemRequest,
} from '../actions';
import reducer, { errors, queries, selectedItems, transientItems, fetching } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'errors',
				'queries',
				'selectedItems',
				'transientItems',
				'fetching',
			] )
		);
	} );

	describe( 'errors()', () => {
		const siteId = 2916284;
		const mediaItem = {
			ID: 42,
		};

		test( 'should default to an empty object', () => {
			const state = errors( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store errors per site on media upload failure', () => {
			const state = errors( {}, setMediaItemErrors( siteId, mediaItem.ID, [ 'some-error' ] ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ 'some-error' ],
				},
			} );
		} );

		test( 'should return a 404 error when failed with http_404 error during external media request', () => {
			const error = { error: 'http_404' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.UPLOAD_VIA_URL_404 ],
				},
			} );
		} );

		test( 'should return an error when there is not enough space to upload during external media request', () => {
			const error = {
				error: 'rest_upload_limited_space',
				message: 'Not enough space to upload',
			};
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.NOT_ENOUGH_SPACE ],
				},
			} );
		} );

		test( 'should return an error when the space quota has been exceeded during external media request', () => {
			const error = {
				error: 'rest_upload_user_quota_exceeded',
				message: 'You have used your space quota',
			};
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT ],
				},
			} );
		} );

		test( 'should return a generic server error when there is another upload error during external media request', () => {
			const error = {
				error: 'upload_error',
				message: 'Some misc upload error has occurred',
			};
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a keyring auth failed error when keyring token failed during external media request', () => {
			const error = { error: 'keyring_token_error' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVICE_AUTH_FAILED ],
				},
			} );
		} );

		test( 'should return a service failure error when service failed during external media request', () => {
			const error = { error: 'servicefail' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			} );
		} );

		test( 'should return a service unavailable error when service was unavailable during an external media request', () => {
			const error = { error: 'service_unavailable' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVICE_UNAVAILABLE ],
				},
			} );
		} );

		test( 'should return a generic server error for any other error during external media request', () => {
			const error = { error: 'something' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a 404 error when failed with http_404 error', () => {
			const error = { error: 'http_404' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.UPLOAD_VIA_URL_404 ],
				},
			} );
		} );

		test( 'should return an error when there is not enough space to upload', () => {
			const error = {
				error: 'rest_upload_limited_space',
				message: 'Not enough space to upload',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.NOT_ENOUGH_SPACE ],
				},
			} );
		} );

		test( 'should return an error when the space quota has been exceeded', () => {
			const error = {
				error: 'rest_upload_user_quota_exceeded',
				message: 'You have used your space quota',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT ],
				},
			} );
		} );

		test( 'should return an error when file is too big to upload', () => {
			const error = {
				error: 'rest_upload_file_too_big',
				message: 'This file is too big',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE ],
				},
			} );
		} );

		test( 'should return a generic server error when there is another upload error', () => {
			const error = {
				error: 'upload_error',
				message: 'Some misc upload error has occurred',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a keyring auth failed error when keyring token failed', () => {
			const error = { error: 'keyring_token_error' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVICE_AUTH_FAILED ],
				},
			} );
		} );

		test( 'should return a service failure error when service failed', () => {
			const error = { error: 'servicefail' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			} );
		} );

		test( 'should return a generic server error for any other error', () => {
			const error = { error: 'something' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should clear errors by type', () => {
			const state = errors(
				{
					[ siteId ]: {
						[ mediaItem.ID ]: [
							MediaValidationErrors.SERVICE_FAILED,
							MediaValidationErrors.SERVER_ERROR,
						],
					},
				},
				clearMediaErrors( siteId, MediaValidationErrors.SERVICE_FAILED )
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should clear errors for a media with a specified ID', () => {
			const otherMediaId = 123456;
			const state = errors(
				{
					[ siteId ]: {
						[ mediaItem.ID ]: [
							MediaValidationErrors.SERVICE_FAILED,
							MediaValidationErrors.SERVER_ERROR,
						],
						[ otherMediaId ]: [ MediaValidationErrors.SERVICE_FAILED ],
					},
				},
				clearMediaItemErrors( siteId, mediaItem.ID )
			);

			expect( state ).toEqual( {
				[ siteId ]: {
					[ otherMediaId ]: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			} );
		} );

		test( 'should clear all errors when source is changed', () => {
			const otherSiteState = {
				[ 123456 ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			};
			const state = errors(
				{
					[ siteId ]: {
						[ mediaItem.ID ]: [
							MediaValidationErrors.SERVICE_FAILED,
							MediaValidationErrors.SERVER_ERROR,
						],
					},
					...otherSiteState,
				},
				changeMediaSource( siteId )
			);

			expect( state ).toEqual( otherSiteState );
		} );
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

	describe( 'selectedItems()', () => {
		const siteId = 2916284;
		const site = {
			ID: siteId,
		};
		const anotherSiteId = 87654321;
		const mediaId = 42;
		const transientMediaId = 'media-32';
		const mediaItem = {
			ID: [ mediaId ],
		};

		test( 'should default to an empty object', () => {
			const state = selectedItems( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should reset selected items when media source is changed', () => {
			const state = {
				[ siteId ]: [ 1, 2, 3 ],
				[ anotherSiteId ]: [ 1, 2, 3 ],
			};
			const result = selectedItems( deepFreeze( state ), changeMediaSource( siteId ) );

			expect( result ).toEqual( {
				[ siteId ]: [],
				[ anotherSiteId ]: [ 1, 2, 3 ],
			} );
		} );

		test( 'should set selected items, overriding the previous ones for that site', () => {
			const state = {
				[ siteId ]: [ 1, 2, 3 ],
				[ anotherSiteId ]: [ 1, 2, 3 ],
			};
			const result = selectedItems(
				deepFreeze( state ),
				selectMediaItems( siteId, [ mediaItem ] )
			);

			expect( result ).toEqual( {
				[ siteId ]: [ mediaItem.ID ],
				[ anotherSiteId ]: [ 1, 2, 3 ],
			} );
		} );

		test( 'should autoselect transient media item during creation', () => {
			const state = {
				[ site.ID ]: [ 1, 2 ],
			};
			const result = selectedItems( deepFreeze( state ), createMediaItem( site, mediaItem ) );

			expect( result ).toEqual( {
				[ site.ID ]: [ 1, 2, mediaItem.ID ],
			} );
		} );

		test( 'should add any newly uploaded media items after successful upload', () => {
			const state = {
				[ site.ID ]: [ 1, 2 ],
			};
			const result = selectedItems( deepFreeze( state ), receiveMedia( siteId, [ mediaItem ] ) );

			expect( result ).toEqual( {
				[ site.ID ]: [ 1, 2, mediaItem.ID ],
			} );
		} );

		test( 'should not duplicate already selected media items', () => {
			const state = {
				[ site.ID ]: [ mediaItem.ID ],
			};
			const result = selectedItems( deepFreeze( state ), receiveMedia( siteId, [ mediaItem ] ) );

			expect( result ).toEqual( {
				[ site.ID ]: [ mediaItem.ID ],
			} );
		} );

		test( 'should deselect any transient media item after its corresponding media was successfully uploaded', () => {
			const state = {
				[ site.ID ]: [ 1, transientMediaId, 2 ],
			};
			const result = selectedItems(
				deepFreeze( state ),
				successMediaItemRequest( siteId, transientMediaId )
			);

			expect( result ).toEqual( {
				[ site.ID ]: [ 1, 2 ],
			} );
		} );

		test( 'should deselect any media items that are being removed', () => {
			const state = {
				[ site.ID ]: [ 1, mediaId, 2 ],
			};
			const result = selectedItems( deepFreeze( state ), deleteMedia( siteId, [ 1, 2 ] ) );

			expect( result ).toEqual( {
				[ site.ID ]: [ mediaId ],
			} );
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

		describe( 'MEDIA_SOURCE_CHANGE', () => {
			const action = changeMediaSource( site.ID );

			test( 'should clear the transient items and id mappings for the site', () => {
				const result = transientItems( {}, action );

				expect( result ).toEqual( {
					[ siteId ]: {
						transientItems: {},
						transientIdsToServerIds: {},
					},
				} );
			} );

			test( 'should not clear a different site', () => {
				const anotherSiteState = Symbol( 'another site' );
				const result = transientItems(
					{
						[ anotherSiteId ]: anotherSiteState,
						[ action.siteId ]: {},
					},
					action
				);

				expect( result ).toEqual( {
					[ siteId ]: {
						transientItems: {},
						transientIdsToServerIds: {},
					},
					[ anotherSiteId ]: anotherSiteState,
				} );
			} );
		} );

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

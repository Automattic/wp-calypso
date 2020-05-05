/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { errors, queries, queryRequests, mediaItemRequests } from '../reducer';
import MediaQueryManager from 'lib/query-manager/media';
import {
	DESERIALIZE,
	MEDIA_DELETE,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_RECEIVE,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_REQUESTING,
	SERIALIZE,
} from 'state/action-types';
import {
	changeMediaSource,
	clearMediaErrors,
	clearMediaItemErrors,
	createMediaItem,
	failMediaItemRequest,
	failMediaRequest,
} from '../actions';
import { ValidationErrors as MediaValidationErrors } from 'lib/media/constants';

jest.mock( 'lib/media/utils', () => ( {
	validateMediaItem: () => [ 'some-error' ],
} ) );

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'errors',
			'queries',
			'queryRequests',
			'mediaItemRequests',
		] );
	} );

	describe( 'errors()', () => {
		const siteId = 2916284;
		const site = {
			ID: siteId,
		};
		const mediaItem = {
			ID: 42,
		};

		test( 'should default to an empty object', () => {
			const state = errors( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store errors per site on media upload failure', () => {
			const state = errors( {}, createMediaItem( site, mediaItem ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ 'some-error' ],
				},
			} );
		} );

		test( 'should return a 404 error when failed with http_404 error during external media request', () => {
			const error = { error: 'http_404' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.UPLOAD_VIA_URL_404 ],
				},
			} );
		} );

		test( 'should return an error when there is not enough space to upload during external media request', () => {
			const error = {
				error: 'upload_error',
				message: 'Not enough space to upload',
			};
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.NOT_ENOUGH_SPACE ],
				},
			} );
		} );

		test( 'should return an error when the space quota has been exceeded during external media request', () => {
			const error = {
				error: 'upload_error',
				message: 'You have used your space quota',
			};
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a keyring auth failed error when keyring token failed during external media request', () => {
			const error = { error: 'keyring_token_error' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVICE_AUTH_FAILED ],
				},
			} );
		} );

		test( 'should return a service failure error when service failed during external media request', () => {
			const error = { error: 'servicefail' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			} );
		} );

		test( 'should return a generic server error for any other error during external media request', () => {
			const error = { error: 'something' };
			const state = errors( {}, failMediaRequest( siteId, {}, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					0: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a 404 error when failed with http_404 error', () => {
			const error = { error: 'http_404' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.UPLOAD_VIA_URL_404 ],
				},
			} );
		} );

		test( 'should return an error when there is not enough space to upload', () => {
			const error = {
				error: 'upload_error',
				message: 'Not enough space to upload',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.NOT_ENOUGH_SPACE ],
				},
			} );
		} );

		test( 'should return an error when the space quota has been exceeded', () => {
			const error = {
				error: 'upload_error',
				message: 'You have used your space quota',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT ],
				},
			} );
		} );

		test( 'should return a generic server error when there is another upload error', () => {
			const error = {
				error: 'upload_error',
				message: 'Some misc upload error has occurred',
			};
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVER_ERROR ],
				},
			} );
		} );

		test( 'should return a keyring auth failed error when keyring token failed', () => {
			const error = { error: 'keyring_token_error' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVICE_AUTH_FAILED ],
				},
			} );
		} );

		test( 'should return a service failure error when service failed', () => {
			const error = { error: 'servicefail' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
				[ siteId ]: {
					[ mediaItem.ID ]: [ MediaValidationErrors.SERVICE_FAILED ],
				},
			} );
		} );

		test( 'should return a generic server error for any other error', () => {
			const error = { error: 'something' };
			const state = errors( {}, failMediaItemRequest( siteId, mediaItem.ID, error ) );

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( {
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

			expect( state ).to.eql( otherSiteState );
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

			expect( state ).to.eql( {} );
		} );

		test( 'should track media receive', () => {
			const state = queries( deepFreeze( {} ), action1 );

			expect( state ).to.have.keys( '2916284' );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.eql( items );
		} );

		test( 'should accumulate query requests', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action2 );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( query2 ) ).to.have.length( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action1 );

			expect( state ).to.equal( previousState );
		} );

		test( 'should track posts even if not associated with a query', () => {
			const state = queries( deepFreeze( {} ), {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				media: items,
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems() ).to.eql( items );
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

			expect( state[ 2916284 ].getItem( 42 ) ).to.eql( updatedItem );
		} );

		test( 'should remove item when post delete action success dispatched', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).to.be.undefined;
			expect( state[ 2916284 ].getItems() ).to.be.empty;
		} );
	} );

	describe( 'queryRequests()', () => {
		const query1 = {
			search: 'flower',
		};

		const query2 = {
			search: 'flowers',
		};

		const state1 = {
			2916284: {
				[ MediaQueryManager.QueryKey.stringify( query1 ) ]: true,
			},
		};

		const state2 = {
			2916284: {
				...state1[ 2916284 ],
				[ MediaQueryManager.QueryKey.stringify( query2 ) ]: true,
			},
		};

		test( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track media requesting', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query1,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should accumulate queries', () => {
			const state = queryRequests( deepFreeze( state1 ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state2 );
		} );

		test( 'should track media request success', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_REQUEST_SUCCESS,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should track media request failures', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_REQUEST_FAILURE,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should never persist state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'mediaItemRequests()', () => {
		const state1 = {
			2916284: {
				[ 10 ]: true,
			},
		};

		const state2 = {
			2916284: {
				...state1[ 2916284 ],
				[ 20 ]: true,
			},
		};

		test( 'should default to an empty object', () => {
			const state = mediaItemRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track media item requesting', () => {
			const state = mediaItemRequests( deepFreeze( {} ), {
				type: MEDIA_ITEM_REQUESTING,
				siteId: 2916284,
				mediaId: 10,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should accumulate requests', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), {
				type: MEDIA_ITEM_REQUESTING,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state2 );
		} );

		test( 'should track media request success', () => {
			const state = mediaItemRequests( deepFreeze( state2 ), {
				type: MEDIA_ITEM_REQUEST_SUCCESS,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should track media request failures', () => {
			const state = mediaItemRequests( deepFreeze( state2 ), {
				type: MEDIA_ITEM_REQUEST_FAILURE,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should never persist state', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );

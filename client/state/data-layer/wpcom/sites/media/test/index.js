/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	requestingMedia, requestingMediaItem, successMediaRequest, successMediaItemRequest, failMediaRequest, failMediaItemRequest, receiveMedia
} from 'state/media/actions';
import { requestMediaItem, requestMediaSuccess, requestMediaError, requestMedia } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	describe( 'media request', () => {
		const getState = () => ( {
			media: {
				queryRequests: {
					2916284: {
						'[]': true
					}
				}
			}
		} );

		it( 'should not dispatch anything if the request is in flight', () => {
			requestMedia( { dispatch, getState }, { siteId: 2916284 } );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch REQUESTING action when request triggers', () => {
			requestMedia( { dispatch, getState }, { siteId: 2916284, query: 'a=b' } );
			expect( dispatch ).to.have.been.calledWith( requestingMedia( 2916284, 'a=b' ) );
		} );

		it( 'should dispatch SUCCESS action when request completes', () => {
			requestMediaSuccess( { dispatch }, { siteId: 2916284, query: 'a=b' },
				{ media: { ID: 10, title: 'media title' }, found: true } );
			expect( dispatch ).to.have.been.calledWith( successMediaRequest( 2916284, 'a=b' ) );
			expect( dispatch ).to.have.been.calledWith( receiveMedia( 2916284, { ID: 10, title: 'media title' }, true, 'a=b' ) );
		} );

		it( 'should dispatch FAILURE action when request fails', () => {
			requestMediaError( { dispatch }, { siteId: 2916284, query: 'a=b' } );
			expect( dispatch ).to.have.been.calledWith( failMediaRequest( 2916284, 'a=b' ) );
		} );

		it( 'should dispatch http request', () => {
			requestMedia( { dispatch, getState }, { siteId: 2916284, query: 'a=b' } );
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'GET',
						path: '/sites/2916284/media',
						apiVersion: '1.1',
					},
					{ siteId: 2916284, query: 'a=b' }
				)
			);
		} );
	} );

	describe( 'media item request', () => {
		const getState = () => ( {
			media: {
				mediaItemRequests: {
					2916284: {
						15: true
					}
				}
			}
		} );

		useNock( nock => (
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/sites/2916284/media/10' )
				.reply( 200, {
					ID: 10,
					title: 'media title'
				} )
				.get( '/rest/v1.2/sites/2916284/media/20' )
				.reply( 400, {} )
		) );

		it( 'should not dispatch anything if the request is in flight', () => {
			requestMediaItem( { dispatch, getState }, { siteId: 2916284, mediaId: 15 } );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch REQUESTING action when request triggers', () => {
			requestMediaItem( { dispatch, getState }, { siteId: 2916284, mediaId: 10 } );
			expect( dispatch ).to.have.been.calledWith( requestingMediaItem( 2916284, 10 ) );
		} );

		it( 'should dispatch SUCCESS action when request completes', () => {
			return requestMediaItem( { dispatch, getState }, { siteId: 2916284, mediaId: 10 } )
				.then( () => {
					expect( dispatch ).to.have.been.calledWith( successMediaItemRequest( 2916284, 10 ) );
					expect( dispatch ).to.have.been.calledWith( receiveMedia( 2916284, { ID: 10, title: 'media title' } ) );
				} );
		} );

		it( 'should dispatch FAILURE action when request fails', () => {
			return requestMediaItem( { dispatch, getState }, { siteId: 2916284, mediaId: 20 } )
				.catch( () => {
					expect( dispatch ).to.have.been.calledWith( failMediaItemRequest( 2916284, 20 ) );
				} );
		} );
	} );
} );

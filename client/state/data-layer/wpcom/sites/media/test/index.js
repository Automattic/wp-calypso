/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { handleMediaItemRequest, receiveMediaItem, receiveMediaItemError } from '../';
import { requestMediaSuccess, requestMediaError, requestMedia } from '../';
import { MEDIA_ITEM_REQUEST } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import {
	failMediaItemRequest,
	failMediaRequest,
	receiveMedia,
	requestingMedia,
	requestingMediaItem,
	successMediaItemRequest,
	successMediaRequest,
} from 'client/state/media/actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'media request', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	const getState = () => ( {
		media: {
			queryRequests: {
				2916284: {
					'[]': true,
				},
			},
		},
	} );

	test( 'should dispatch REQUESTING action when request triggers', () => {
		requestMedia( { dispatch, getState }, { siteId: 2916284, query: 'a=b' } );
		expect( dispatch ).to.have.been.calledWith( requestingMedia( 2916284, 'a=b' ) );
	} );

	test( 'should dispatch SUCCESS action when request completes', () => {
		requestMediaSuccess(
			{ dispatch },
			{ siteId: 2916284, query: 'a=b' },
			{ media: { ID: 10, title: 'media title' }, found: true }
		);
		expect( dispatch ).to.have.been.calledWith( successMediaRequest( 2916284, 'a=b' ) );
		expect( dispatch ).to.have.been.calledWith(
			receiveMedia( 2916284, { ID: 10, title: 'media title' }, true, 'a=b' )
		);
	} );

	test( 'should dispatch FAILURE action when request fails', () => {
		requestMediaError( { dispatch }, { siteId: 2916284, query: 'a=b' } );
		expect( dispatch ).to.have.been.calledWith( failMediaRequest( 2916284, 'a=b' ) );
	} );

	test( 'should dispatch http request', () => {
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

describe( 'handleMediaItemRequest', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	test( 'should dispatch an http action', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		handleMediaItemRequest( { dispatch }, action );
		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( requestingMediaItem( siteId ) );
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiVersion: '1.2',
					method: 'GET',
					path: `/sites/${ siteId }/media/${ mediaId }`,
				},
				action
			)
		);
	} );
} );

describe( 'receiveMediaItem', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	test( 'should dispatch media recieve actions', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		const media = { ID: 91827364 };
		receiveMediaItem( { dispatch }, action, media );
		expect( dispatch ).to.have.been.calledTwice,
			expect( dispatch ).to.have.been.calledWith( receiveMedia( siteId, media ) );
		expect( dispatch ).to.have.been.calledWith( successMediaItemRequest( siteId, mediaId ) );
	} );
} );

describe( 'receiveMediaItemError', () => {
	let dispatch;

	useSandbox( sandbox => ( dispatch = sandbox.spy() ) );

	test( 'should dispatch failure', () => {
		const siteId = 12345;
		const mediaId = 67890;
		const action = {
			type: MEDIA_ITEM_REQUEST,
			mediaId,
			siteId,
		};
		receiveMediaItemError( { dispatch }, action );
		expect( dispatch ).to.have.been.calledWith( failMediaItemRequest( siteId, mediaId ) );
	} );
} );

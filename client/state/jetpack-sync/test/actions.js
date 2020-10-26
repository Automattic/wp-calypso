/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
} from 'calypso/state/action-types';
import { getSyncStatus, scheduleJetpackFullysync } from '../actions';
import useNock from 'calypso/test-helpers/use-nock';
import { useSandbox } from 'calypso/test-helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#getSyncStatus()', () => {
		const siteId = '123456';
		const data = {
			started: 1466010260,
			queue_finished: 1466010260,
			sent_started: 1466010290,
			finished: 1466010313,
			queue: {
				constants: 1,
				functions: 1,
				options: 1,
				terms: 3,
				themes: 1,
				users: 2,
				posts: 15,
				comments: 1,
				updates: 6,
			},
			sent: {
				constants: 1,
				functions: 1,
				options: 1,
				terms: 3,
				themes: 1,
				users: 2,
				posts: 15,
				comments: 1,
			},
			is_scheduled: false,
		};
		const reply = Object.assign( {}, data );

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/sites/' + siteId + '/sync/status' )
					.reply( 200, reply );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				getSyncStatus( siteId )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_SYNC_STATUS_REQUEST,
				} );
			} );

			test( 'should dispatch success action when request completes', () => {
				return getSyncStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						siteId: siteId,
						type: JETPACK_SYNC_STATUS_SUCCESS,
						data: data,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/sites/' + siteId + '/sync/status' )
					.reply(
						403,
						{
							error: 'unauthorized',
							message: 'User cannot access this restricted blog',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch receive action when request completes', () => {
				return getSyncStatus( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: {
							error: 'unauthorized',
							message: 'User cannot access this restricted blog',
							status: 403,
						},
						type: JETPACK_SYNC_STATUS_ERROR,
						siteId: siteId,
					} );
				} );
			} );
		} );
	} );

	describe( '#scheduleJetpackFullysync()', () => {
		const siteId = '123456';
		const data = {
			scheduled: true,
		};
		const reply = Object.assign( {}, data );

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/sites/' + siteId + '/sync' )
					.reply( 200, reply );
			} );

			test( 'should dispatch request action when thunk triggered', () => {
				scheduleJetpackFullysync( siteId )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_SYNC_START_REQUEST,
				} );
			} );

			test( 'should dispatch success action when request completes', () => {
				return scheduleJetpackFullysync( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						siteId: siteId,
						type: JETPACK_SYNC_START_SUCCESS,
						data: data,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/sites/' + siteId + '/sync' )
					.reply(
						403,
						{
							error: 'unauthorized',
							message: 'User cannot access this restricted blog',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch receive action when request completes', () => {
				return scheduleJetpackFullysync( siteId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: {
							error: 'unauthorized',
							message: 'User cannot access this restricted blog',
							status: 403,
						},
						type: JETPACK_SYNC_START_ERROR,
						siteId: siteId,
					} );
				} );
			} );
		} );
	} );
} );

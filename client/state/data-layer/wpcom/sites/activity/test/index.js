/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { handleActivityLogRequest, receiveActivityLogError, receiveActivityLog } from '..';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { activityLogError, activityLogRequest } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

const SITE_ID = 77203074;

const SUCCESS_RESPONSE = deepFreeze( {
	'@context': 'https://www.w3.org/ns/activitystreams',
	orderedItems: [
		{
			summary: 'Jane Doe updated post I wrote a new post!',
			name: 'post__updated',
			actor: {
				type: 'Person',
				name: 'Jane Doe',
				role: 'administrator',
				external_user_id: 1,
				wpcom_user_id: 12345,
				icon: {
					type: 'Image',
					url: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
					width: 96,
					height: 96,
				},
			},
			type: 'Updated',
			object: {
				type: 'Article',
				name: 'I wrote a new post!',
				object_id: 100,
				object_type: 'post',
				object_status: 'publish',
			},
			published: '2014-09-14T00:30:00+02:00',
			generator: {
				jetpack_version: 5.3,
				blog_id: 123456,
			},
			gridicon: 'posts',
			activity_id: 'foobarbaz',
		},
	],
	summary: 'Activity log',
	totalItems: 1,
	type: 'OrderedCollection',
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'unknown_blog',
	message: 'Unknown blog',
} );

describe( 'receiveActivityLog', () => {
	it( 'should dispatch activity log update action', () => {
		const dispatch = sinon.spy();
		receiveActivityLog( { dispatch }, { siteId: SITE_ID }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.called.once;
		expect( dispatch.args[ 0 ][ 0 ] )
			.to.be.an( 'object' )
			.that.has.keys( [ 'type', 'siteId', 'data' ] )
			.that.has.property( 'type', ACTIVITY_LOG_UPDATE );
	} );
} );

describe( 'receiveActivityLogError', () => {
	it( 'should dispatch activity log error action', () => {
		const dispatch = sinon.spy();
		receiveActivityLogError( { dispatch }, { siteId: SITE_ID }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			activityLogError( SITE_ID, {
				error: 'unknown_blog',
				message: 'Unknown blog',
			} )
		);
	} );
} );

describe( 'handleActivityLogRequest', () => {
	it( 'should dispatch HTTP action with default when no params are passed', () => {
		const action = activityLogRequest( SITE_ID );
		const dispatch = sinon.spy();

		handleActivityLogRequest( { dispatch }, action );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ SITE_ID }/activity`,
					query: {},
				},
				action
			)
		);
	} );

	it( 'should dispatch HTTP action with provided parameters', () => {
		const action = activityLogRequest( SITE_ID, {
			date_end: 1500300000000,
			date_start: 1500000000000,
			group: 'post',
			name: 'post__published',
			number: 10,
		} );
		const dispatch = sinon.spy();

		handleActivityLogRequest( { dispatch }, action );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ SITE_ID }/activity`,
					query: {
						date_end: 1500300000000,
						date_start: 1500000000000,
						group: 'post',
						name: 'post__published',
						number: 10,
					},
				},
				action
			)
		);
	} );

	it( 'should handle camelCase parameters', () => {
		const action = activityLogRequest( SITE_ID, {
			dateEnd: 1500300000000,
			dateStart: 1500000000000,
		} );
		const dispatch = sinon.spy();

		handleActivityLogRequest( { dispatch }, action );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ SITE_ID }/activity`,
					query: {
						date_end: 1500300000000,
						date_start: 1500000000000,
					},
				},
				action
			)
		);
	} );
} );

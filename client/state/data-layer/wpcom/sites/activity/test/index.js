/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { handleActivityLogRequest, receiveActivityLogError, receiveActivityLog } from '..';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { activityLogRequest } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';

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
			is_rewindable: false,
			rewind_id: 0,
		},
	],
	summary: 'Activity log',
	totalItems: 1,
	type: 'OrderedCollection',
} );

describe( 'receiveActivityLog', () => {
	test( 'should dispatch activity log update action', () => {
		const dispatch = sinon.spy();
		receiveActivityLog( { dispatch }, { siteId: SITE_ID }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.called.once;
		expect( dispatch.args[ 0 ][ 0 ] )
			.to.be.an( 'object' )
			.that.has.keys( [ 'data', 'found', 'query', 'siteId', 'type' ] )
			.that.includes( {
				found: 1,
				type: ACTIVITY_LOG_UPDATE,
			} );
	} );
} );

describe( 'receiveActivityLogError', () => {
	test( 'should dispatch activity log error action', () => {
		const dispatch = sinon.spy();
		receiveActivityLogError( { dispatch } );
		expect( dispatch ).to.have.been.called.once;
		expect( dispatch ).to.have.been.calledWith(
			errorNotice( translate( 'Error receiving activity for site.' ), { id: '1' } )
		);
	} );
} );

describe( 'handleActivityLogRequest', () => {
	test( 'should dispatch HTTP action with default when no params are passed', () => {
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

	test( 'should dispatch HTTP action with provided parameters', () => {
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

	test( 'should handle camelCase parameters', () => {
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

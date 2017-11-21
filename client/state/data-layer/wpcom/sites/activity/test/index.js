/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
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
	test( 'should return activity log update action', () => {
		const response = receiveActivityLog( { siteId: SITE_ID }, SUCCESS_RESPONSE );
		expect( response ).toHaveProperty( 'data' );
		expect( response ).toHaveProperty( 'query' );
		expect( response ).toMatchObject( {
			found: 1,
			siteId: SITE_ID,
			type: ACTIVITY_LOG_UPDATE,
		} );
	} );
} );

describe( 'receiveActivityLogError', () => {
	test( 'should return activity log error action', () =>
		expect( receiveActivityLogError() ).toEqual(
			errorNotice( translate( 'Error receiving activity for site.' ), { id: '1' } )
		) );
} );

describe( 'handleActivityLogRequest', () => {
	test( 'should return HTTP action with default when no params are passed', () => {
		const action = activityLogRequest( SITE_ID );

		expect( handleActivityLogRequest( action ) ).toMatchObject(
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

	test( 'should return HTTP action with provided parameters', () => {
		const action = activityLogRequest( SITE_ID, {
			date_end: 1500300000000,
			date_start: 1500000000000,
			group: 'post',
			name: 'post__published',
			number: 10,
		} );

		expect( handleActivityLogRequest( action ) ).toMatchObject(
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

		expect( handleActivityLogRequest( action ) ).toMatchObject(
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

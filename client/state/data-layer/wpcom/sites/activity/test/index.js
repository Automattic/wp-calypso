/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	handleActivityLogRequest,
	receiveActivityLogError,
	receiveActivityLog,
} from '..';
import {
	activityLogError,
	activityLogRequest,
	activityLogUpdate,
} from 'state/activity-log/actions';

const SITE_ID = 77203074;

const SUCCESS_RESPONSE = deepFreeze( {
	activities: [
		{
			ts_site: 1496692768557,
			type: 'jetpack-audit',
			action_trigger: 'publicize_save_published_action',
			lag: 0,
			jetpack_version: '5.0-alpha',
			ts_utc: 1496692768557,
			action: 'publicized',
			es_retention: 'long',
			group: 'post',
			blog_id: 77203074,
			hdfs_retention: 'long',
			actor: {
				displayname: 'User',
				external_id: 1,
				login: 'user'
			},
			ts_sent_action: 1496692768557,
			name: 'post__publicized',
			site_id: 2,
			error_code: '',
			ts_recieved_action: 1496692768557
		},
	],
	found: 1,
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'unknown_blog',
	message: 'Unknown blog'
} );

describe( 'receiveActivityLog', () => {
	it( 'should dispatch activity log update action', () => {
		const dispatch = sinon.spy();
		receiveActivityLog( { dispatch }, { siteId: SITE_ID }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWithMatch(
			activityLogUpdate( SITE_ID, [
				{
					ts_site: 1496692768557,
					type: 'jetpack-audit',
					action_trigger: 'publicize_save_published_action',
					lag: 0,
					jetpack_version: '5.0-alpha',
					ts_utc: 1496692768557,
					action: 'publicized',
					es_retention: 'long',
					group: 'post',
					blog_id: 77203074,
					hdfs_retention: 'long',
					actor: {
						displayname: 'User',
						external_id: 1,
						login: 'user'
					},
					ts_sent_action: 1496692768557,
					name: 'post__publicized',
					site_id: 2,
					error_code: '',
					ts_recieved_action: 1496692768557
				},
			] )
		);
	} );
} );

describe( 'receiveActivityLogError', () => {
	it( 'should dispatch activity log error action', () => {
		const dispatch = sinon.spy();
		receiveActivityLogError( { dispatch }, { siteId: SITE_ID }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			activityLogError( SITE_ID, {
				error: 'unknown_blog',
				message: 'Unknown blog'
			} )
		);
	} );
} );

describe( 'handleActivityLogRequest', () => {
	it( 'should dispatch HTTP action with default when no params are passed', () => {
		const action = activityLogRequest( SITE_ID );
		const dispatch = sinon.spy();

		handleActivityLogRequest( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			apiVersion: '1',
			method: 'GET',
			path: `/sites/${ SITE_ID }/activity`,
			query: {},
		}, action ) );
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

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			apiVersion: '1',
			method: 'GET',
			path: `/sites/${ SITE_ID }/activity`,
			query: {
				date_end: 1500300000000,
				date_start: 1500000000000,
				group: 'post',
				name: 'post__published',
				number: 10,
			},
		}, action ) );
	} );
} );

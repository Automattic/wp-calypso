/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	receiveActivityLogError,
	receiveActivityLog,
} from '..';
import {
	activityLogError,
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
		receiveActivityLog( { dispatch }, { siteId: SITE_ID }, null, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWithMatch(
			activityLogUpdate( SITE_ID, {
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
						site_id: 1,
						error_code: '',
						ts_recieved_action: 1496692768557
					},
				],
				found: 1,
			} )
		);
	} );
} );

describe( 'receiveActivityLogError', () => {
	it( 'should dispatch activity log error action', () => {
		const dispatch = sinon.spy();
		receiveActivityLogError( { dispatch }, { siteId: SITE_ID }, null, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			activityLogError( SITE_ID, {
				error: 'unknown_blog',
				message: 'Unknown blog'
			} )
		);
	} );
} );

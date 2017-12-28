/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestNotificationSettings, updateSettings, handleError } from '../';
import { NOTIFICATION_SETTINGS_UPDATE, NOTICE_CREATE } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';

describe( '#requestNotificationSettings()', () => {
	test( 'should dispatch HTTP request to the user notification settings endpoint', () => {
		const dispatch = spy();

		requestNotificationSettings( { dispatch } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http( {
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/notifications/settings',
			} )
		);
	} );
} );

describe( '#updateSettings()', () => {
	test( 'should dispatch notification settings', () => {
		const dispatch = spy();

		updateSettings( { dispatch }, null, {} );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( {
			type: NOTIFICATION_SETTINGS_UPDATE,
			settings: {},
		} );
	} );
} );

describe( '#handleError()', () => {
	test( 'should dispatch error notice', () => {
		const dispatch = spy();

		handleError( { dispatch } );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWithMatch( {
			type: NOTICE_CREATE,
			notice: {
				status: 'is-error',
			},
		} );
	} );
} );

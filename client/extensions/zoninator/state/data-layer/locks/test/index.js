/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { translate } from 'i18n-calypso';
import { omit } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestZoneLock, handleLockSuccess, handleLockFailure } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { requestLock, requestLockError, updateLock } from 'zoninator/state/locks/actions';

describe( '#requestZoneLock()', () => {
	test( 'should dispatch a HTTP request to the lock endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
		};

		requestZoneLock( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/123/rest-api/',
					query: {
						path: '/zoninator/v1/zones/456/lock&_method=PUT',
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
		};

		requestZoneLock( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-update-lock' ) );
	} );
} );

describe( '#handleLockSuccess()', () => {
	const response = {
		data: {
			timeout: 30,
			max_lock_period: 600,
		},
	};

	test( 'should dispatch `updateLock`', () => {
		const dispatch = sinon.spy();
		const action = requestLock( 123, 456, true );

		handleLockSuccess( { dispatch }, action, response );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWithMatch(
			omit( updateLock( 123, 456, 30000, 600000, true ), [ 'expires' ] )
		);
	} );
} );

describe( '#handleLockFailure()', () => {
	test( 'should dispatch `requestLockError`', () => {
		const dispatch = sinon.spy();
		const action = requestLock( 123, 456 );

		handleLockFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( requestLockError( 123, 456, true ) );
	} );

	test( 'should dispatch `errorNotice` if the locking process fails', () => {
		const dispatch = sinon.spy();
		const action = requestLock( 123, 456, false );

		handleLockFailure( { dispatch }, action, {} );

		expect( dispatch ).to.have.been.calledWith(
			errorNotice( translate( 'This zone is currently locked. Please try again later.' ), {
				id: 'zoninator-update-lock',
			} )
		);
	} );
} );

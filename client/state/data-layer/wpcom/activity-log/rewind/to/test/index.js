/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveRestoreSuccess, receiveRestoreError } from '../';
import { getRewindRestoreProgress, rewindRestoreUpdateError } from 'state/activity-log/actions';

const siteId = 77203074;
const timestamp = 1496768464;
const restoreId = 12345;

const SUCCESS_RESPONSE = deepFreeze( {
	ok: true,
	error: '',
	restore_id: restoreId,
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'vp_api_error',
	message: 'Invalid signature.',
	status: 400,
} );

describe( 'receiveRestoreSuccess', () => {
	it( 'should dispatch get restore progress on success', () => {
		const dispatch = sinon.spy();
		receiveRestoreSuccess( { dispatch }, { siteId, timestamp }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			getRewindRestoreProgress( siteId, timestamp, restoreId )
		);
	} );
} );

describe( 'receiveRestoreError', () => {
	it( 'should dispatch update error on error', () => {
		const dispatch = sinon.spy();
		receiveRestoreError( { dispatch }, { siteId, timestamp }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			rewindRestoreUpdateError(
				siteId, timestamp, {
					error: 'vp_api_error',
					message: 'Invalid signature.',
					status: 400,
				}
			)
		);
	} );
} );

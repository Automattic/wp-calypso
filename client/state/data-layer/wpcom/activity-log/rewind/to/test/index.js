/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	receiveRestoreSuccess,
	receiveRestoreError,
} from '../';
import {
	rewindCompleteRestore,
	rewindRestoreUpdateError,
} from 'state/activity-log/actions';

const siteId = 77203074;
const timestamp = 1496768464;

const SUCCESS_RESPONSE = deepFreeze( {
	ok: true,
	error: '',
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'vp_api_error',
	message: 'Invalid signature.',
	status: 400,
} );

describe( 'receiveRestoreSuccess', () => {
	it( 'should dispatch rewind complete restore action', () => {
		const dispatch = sinon.spy();
		receiveRestoreSuccess( { dispatch }, { siteId, timestamp }, null, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			rewindCompleteRestore( siteId, timestamp )
		);
	} );
} );

describe( 'receiveRestoreError', () => {
	it( 'should dispatch rewind restore update error action', () => {
		const dispatch = sinon.spy();
		receiveRestoreError( { dispatch }, { siteId, timestamp }, null, ERROR_RESPONSE );
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

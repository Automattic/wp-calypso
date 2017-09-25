/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveRewindStatus, receiveRewindStatusError } from '../';
import { updateRewindStatus, rewindStatusError } from 'state/activity-log/actions';

const SITE_ID = 77203074;

const SUCCESS_RESPONSE = deepFreeze( {
	ok: true,
	error: '',
	site_id: SITE_ID,
	plan: 'jetpack-premium',
	site_url: 'https://example.com/',
	is_active: true,
	is_plugin_active: true,
	number_of_backups: 26,
	first_backup_when: '2017-05-04 05:00:00',
	last_backup_when: '2017-06-01 23:00:00',
	is_pressable: false,
	use_rewind: true,
	recent_backups: [],
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'vp_api_error',
	message: 'no site found.',
	status: 400,
} );

describe( 'receiveRewindStatus', () => {
	it( 'should dispatch rewind status update action', () => {
		const dispatch = sinon.spy();
		receiveRewindStatus( { dispatch }, { siteId: SITE_ID }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			updateRewindStatus(
				SITE_ID, {
					active: true,
					firstBackupDate: '2017-05-04 05:00:00',
					isPressable: false,
					plan: 'jetpack-premium',
				}
			)
		);
	} );
} );

describe( 'receiveRewindStatusError', () => {
	it( 'should dispatch rewind status error action', () => {
		const dispatch = sinon.spy();
		receiveRewindStatusError( { dispatch }, { siteId: SITE_ID }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			rewindStatusError(
				SITE_ID, {
					error: 'vp_api_error',
					message: 'no site found.',
					status: 400,
				}
			)
		);
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import isJetpackSettingsSaveFailure from 'calypso/state/selectors/is-jetpack-settings-save-failure';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'isJetpackSettingsSaveFailure()', () => {
	const siteId = 12345678;
	const settings = SETTINGS_FIXTURE[ siteId ];
	const action = saveJetpackSettings( siteId, settings );

	test( 'should return false if the site is not attached', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'failure',
				},
			},
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 87654321, settings );

		expect( isFailure ).to.be.false;
	} );

	test( 'should return false if the save request status is success', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'success',
				},
			},
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 12345678, settings );

		expect( isFailure ).to.be.false;
	} );

	test( 'should return true if the save request status is failure', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'failure',
				},
			},
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 12345678, settings );

		expect( isFailure ).to.be.true;
	} );
} );

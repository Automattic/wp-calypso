/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackSettingsSaveRequestStatus from 'calypso/state/selectors/get-jetpack-settings-save-request-status';
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';

describe( 'getJetpackSettingsSaveRequestStatus()', () => {
	const siteId = 12345678;
	const settings = SETTINGS_FIXTURE[ siteId ];
	const action = saveJetpackSettings( siteId, settings );

	test( 'should return undefined if the site is not attached', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 87654321, settings );

		expect( status ).to.be.undefined;
	} );

	test( 'should return success if the save request status is success', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'success',
				},
			},
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678, settings );

		expect( status ).to.eql( 'success' );
	} );

	test( 'should return error if the save request status is error', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'error',
				},
			},
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678, settings );

		expect( status ).to.eql( 'error' );
	} );

	test( 'should return pending if the save request status is pending', () => {
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678, settings );

		expect( status ).to.eql( 'pending' );
	} );
} );

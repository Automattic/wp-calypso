/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import isUpdatingJetpackSettings from 'calypso/state/selectors/is-updating-jetpack-settings';
import { settings as SETTINGS_FIXTURE } from './fixtures/jetpack-settings';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';

describe( 'isUpdatingJetpackSettings()', () => {
	const siteId = 12345678;
	const settings = SETTINGS_FIXTURE[ siteId ];
	const action = saveJetpackSettings( siteId, settings );
	const state = {
		dataRequests: {
			[ getRequestKey( action ) ]: {
				status: 'pending',
			},
		},
	};

	test( 'should return true if settings are currently being updated', () => {
		const output = isUpdatingJetpackSettings( state, siteId, settings );
		expect( output ).to.be.true;
	} );

	test( 'should return false if settings are currently not being updated', () => {
		const output = isUpdatingJetpackSettings( state, 87654321, settings );
		expect( output ).to.be.false;
	} );
} );

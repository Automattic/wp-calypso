/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingSiteMonitorSettings from 'calypso/state/selectors/is-requesting-site-monitor-settings';

describe( 'isRequestingSiteMonitorSettings()', () => {
	const siteId = 2916284;

	test( 'should return true if monitor settings are currently being requested for that site', () => {
		const state = {
			sites: {
				monitor: {
					requesting: {
						[ siteId ]: true,
					},
				},
			},
		};
		const output = isRequestingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if monitor settings are currently not being requested for that site', () => {
		const state = {
			sites: {
				monitor: {
					requesting: {
						[ siteId ]: false,
					},
				},
			},
		};
		const output = isRequestingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return false if monitor settings have never been requested for that site', () => {
		const state = {
			sites: {
				monitor: {
					requesting: {
						77203074: true,
					},
				},
			},
		};
		const output = isRequestingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.false;
	} );
} );

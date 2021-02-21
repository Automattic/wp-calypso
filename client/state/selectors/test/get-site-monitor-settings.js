/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteMonitorSettings from 'calypso/state/selectors/get-site-monitor-settings';

describe( 'getSiteMonitorSettings()', () => {
	const siteId = 2916284;
	const settings = {
		email_notifications: true,
		monitor_active: true,
		wp_note_notifications: true,
	};

	test( 'should return monitor settings for a known site', () => {
		const state = {
			sites: {
				monitor: {
					items: {
						[ siteId ]: settings,
					},
				},
			},
		};
		const output = getSiteMonitorSettings( state, siteId );
		expect( output ).to.eql( settings );
	} );

	test( 'should return null for an unknown site', () => {
		const state = {
			sites: {
				monitor: {
					items: {
						77203074: settings,
					},
				},
			},
		};
		const output = getSiteMonitorSettings( state, siteId );
		expect( output ).to.be.null;
	} );
} );

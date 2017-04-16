/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isUpdatingSiteMonitorSettings } from '../';

describe( 'isUpdatingSiteMonitorSettings()', () => {
	const siteId = 2916284;

	it( 'should return true if monitor settings are currently being updated for that site', () => {
		const state = {
			sites: {
				monitor: {
					updating: {
						[ siteId ]: true,
					}
				}
			}
		};
		const output = isUpdatingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return false if monitor settings are currently not being updated for that site', () => {
		const state = {
			sites: {
				monitor: {
					updating: {
						[ siteId ]: false,
					}
				}
			}
		};
		const output = isUpdatingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.false;
	} );

	it( 'should return false if monitor settings have never been updated for that site', () => {
		const state = {
			sites: {
				monitor: {
					updating: {
						77203074: true,
					}
				}
			}
		};
		const output = isUpdatingSiteMonitorSettings( state, siteId );
		expect( output ).to.be.false;
	} );
} );

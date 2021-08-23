import { MARKETING_CLICK_UPGRADE_NUDGE } from 'calypso/state/action-types';
import { clickUpgradeNudge } from '../actions';

describe( 'clickUpgradeNudge()', () => {
	test( 'should return the expected action object', () => {
		const nudgeName = 'profit!';
		const siteId = 123;

		expect( clickUpgradeNudge( siteId, nudgeName ) ).toEqual( {
			type: MARKETING_CLICK_UPGRADE_NUDGE,
			siteId,
			nudgeName,
		} );
	} );
} );

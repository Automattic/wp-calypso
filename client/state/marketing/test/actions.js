/**
 * Internal dependencies
 */
import { clickUpgradeNudge } from '../actions';
import { MARKETING_CLICK_UPGRADE_NUDGE } from 'state/action-types';

describe( 'clickUpgradeNudge()', () => {
	test( 'should return the expected action object', () => {
		const nudgeName = 'profit!';

		expect( clickUpgradeNudge( nudgeName ) ).toEqual( {
			type: MARKETING_CLICK_UPGRADE_NUDGE,
			nudgeName,
		} );
	} );
} );

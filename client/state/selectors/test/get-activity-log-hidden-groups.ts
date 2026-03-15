import { WPCOM_FEATURES_BACKUPS_SELF_SERVE } from '@automattic/calypso-products';
import getActivityLogHiddenGroups from 'calypso/state/selectors/get-activity-log-hidden-groups';
import type { AppState } from 'calypso/types';

describe( 'getActivityLogHiddenGroups()', () => {
	test( 'should return undefined when siteId is null', () => {
		const state = {} as AppState;
		expect( getActivityLogHiddenGroups( state, null ) ).toBeUndefined();
	} );

	test( 'should return hidden groups when site does not have backups self-serve feature', () => {
		const state = {
			sites: {
				features: {
					123: {
						data: {
							active: [],
						},
					},
				},
			},
		} as unknown as AppState;
		expect( getActivityLogHiddenGroups( state, 123 ) ).toEqual( [ 'rewind', 'scan' ] );
	} );

	test( 'should return undefined when site has backups self-serve feature', () => {
		const state = {
			sites: {
				features: {
					123: {
						data: {
							active: [ WPCOM_FEATURES_BACKUPS_SELF_SERVE ],
						},
					},
				},
			},
		} as unknown as AppState;
		expect( getActivityLogHiddenGroups( state, 123 ) ).toBeUndefined();
	} );

	test( 'should return hidden groups when site features are not loaded', () => {
		const state = {
			sites: {
				features: {},
			},
		} as unknown as AppState;
		expect( getActivityLogHiddenGroups( state, 123 ) ).toEqual( [ 'rewind', 'scan' ] );
	} );
} );

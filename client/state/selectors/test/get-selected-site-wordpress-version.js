/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getSelectedSiteWordPressVersion from '../get-selected-site-wordpress-version';
import { userState } from 'state/selectors/test/fixtures/user-state';

describe( 'getSelectedSiteWordPressVersion()', () => {
	test( 'should return correct version value.', () => {
		const wpVersion = '5.0-RC3-43969';

		const state = deepFreeze( {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						options: {
							software_version: wpVersion,
						},
					},
				},
			},
			ui: {
				selectedSiteId: 2916284,
			},
		} );

		expect( getSelectedSiteWordPressVersion( state ) ).toEqual( wpVersion );
	} );
	test( 'should return undefined when no version is set.', () => {
		const state = deepFreeze( {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
					},
				},
			},
			ui: {
				selectedSiteId: 2916284,
			},
		} );

		expect( getSelectedSiteWordPressVersion( state ) ).toBe( undefined );
	} );
} );

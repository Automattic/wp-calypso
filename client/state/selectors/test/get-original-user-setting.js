/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getOriginalUserSetting from 'calypso/state/selectors/get-original-user-setting';

describe( 'getOriginalUserSetting()', () => {
	test( 'should return null if the server values were not received yet', () => {
		const setting = getOriginalUserSetting(
			{
				userSettings: {
					settings: false,
					unsavedSettings: {},
				},
			},
			'foo'
		);

		expect( setting ).to.be.null;
	} );

	test( 'should ignore the unsaved settings and always return the server value', () => {
		const setting = getOriginalUserSetting(
			{
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: { foo: 'unsavedBar' },
				},
			},
			'foo'
		);

		expect( setting ).to.eql( 'bar' );
	} );
} );

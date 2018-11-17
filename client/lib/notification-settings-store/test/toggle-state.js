/** @format */
/**
 * External dependencies
 */
import { fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import toggleState from '../toggle-state';

describe( 'toggleState.wpcom', () => {
	describe( 'when setting does not yet have a value', () => {
		test( 'should assign the value of `true` to that setting', () => {
			const settingToToggle = 'exampleSetting';
			const startingStateJS = {
				settings: {},
			};
			const startingState = fromJS( startingStateJS );

			const result = toggleState.wpcom( startingState, null, null, settingToToggle );
			const actual = result.toJS();
			const expected = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: true,
						},
					},
				},
			};

			expect( actual ).toEqual( expected );
		} );
	} );

	describe( 'when setting already has a value', () => {
		test( 'should toggle the value of that setting', () => {
			const settingToToggle = 'exampleSetting';
			const startingStateJS = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: true,
						},
					},
				},
			};
			const startingState = fromJS( startingStateJS );

			const result = toggleState.wpcom( startingState, null, null, settingToToggle );
			const actual = result.toJS();
			const expected = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: false,
						},
					},
				},
			};

			expect( actual ).toEqual( expected );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';

describe( 'getCurrentLocaleVariant()', () => {
	test( 'should return null as default', () => {
		const state = {
			ui: {
				language: {},
			},
		};

		expect( getCurrentLocaleVariant( state ) ).to.be.null;
	} );

	test( 'should return the locale variant slug stored', () => {
		const localeVariant = 'awesome_variant';
		const state = {
			ui: {
				language: {
					localeVariant,
				},
			},
		};

		expect( getCurrentLocaleVariant( state ) ).to.eql( localeVariant );
	} );
} );

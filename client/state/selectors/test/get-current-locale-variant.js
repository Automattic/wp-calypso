import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';

describe( 'getCurrentLocaleVariant()', () => {
	test( 'should return null as default', () => {
		const state = {
			ui: {
				language: {},
			},
		};

		expect( getCurrentLocaleVariant( state ) ).toBeNull();
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

		expect( getCurrentLocaleVariant( state ) ).toEqual( localeVariant );
	} );
} );

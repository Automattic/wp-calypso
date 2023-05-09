import { LOCALE_SET } from 'calypso/state/action-types';
import { setLocale } from '../actions';

describe( 'actions', () => {
	describe( 'setLocale', () => {
		test( 'returns an appropriate action', () => {
			expect( setLocale( 'he' ) ).toEqual( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: null,
			} );
		} );

		test( 'returns an action with localeVariant set', () => {
			expect( setLocale( 'he', 'he_formal' ) ).toEqual( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: 'he_formal',
			} );
		} );
	} );
} );

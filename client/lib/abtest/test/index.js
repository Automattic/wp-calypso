/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { get as getStoreStub, set as setSpy } from 'store';

/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';
import { getUserStub } from 'calypso/lib/user';

const NODE_ENV = process.env.NODE_ENV;
beforeAll( () => {
	process.env.NODE_ENV = 'production';
} );

afterAll( () => {
	process.env.NODE_ENV = NODE_ENV;
} );

jest.mock( 'calypso/lib/abtest/active-tests', () => ( {
	mockedTest: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: false,
	},
	mockedTestAllowAnyLocale: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		localeTargets: 'any',
	},
	multipeLocaleNotEn: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		localeTargets: [ 'fr', 'de' ],
	},
	mockedTestFrLocale: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		localeTargets: [ 'fr' ],
	},
	mockedTestIlInCountryCodeTargets: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		countryCodeTargets: [ 'IL', 'IN' ],
	},
	mockedTestAllowExisting: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50,
		},
		defaultVariation: 'hide',
		allowExistingUsers: true,
	},
} ) );
jest.mock( 'calypso/lib/user', () => {
	const getStub = jest.fn();

	const user = () => ( {
		get: getStub,
	} );
	user.getUserStub = getStub;

	return user;
} );
jest.mock( 'store', () => ( {
	enabled: () => true,
	get: jest.fn(),
	set: jest.fn(),
} ) );

const DATE_BEFORE = '2015-06-30T01:32:21.196Z';
const DATE_AFTER = '2016-06-30T01:32:21.196Z';

describe( 'abtest', () => {
	beforeEach( () => {
		setSpy.mockReset();
	} );
	describe( 'stored value', () => {
		beforeEach( () => {
			getStoreStub.mockReturnValueOnce( { mockedTest_20160627: 'show' } );
		} );

		test( 'should return stored value and skip store.set for existing users', () => {
			getUserStub.mockReturnValueOnce( {
				localeSlug: 'en',
				date: DATE_BEFORE,
			} );
			window.navigator = {
				language: 'en',
				languages: [ 'en' ],
			};
			expect( abtest( 'mockedTest' ) ).toBe( 'show' );
			expect( setSpy ).not.toHaveBeenCalled();
		} );

		test( 'should return stored value and skip store.set for any user, including new, non-English users', () => {
			getUserStub.mockReturnValueOnce( {
				localeSlug: 'de',
				date: DATE_AFTER,
			} );
			expect( abtest( 'mockedTest' ) ).toBe( 'show' );
			expect( setSpy ).not.toHaveBeenCalled();
		} );

		test( 'should return stored value and skip store.set for a logged-out user', () => {
			getUserStub.mockReturnValueOnce( null );
			expect( abtest( 'mockedTest' ) ).toBe( 'show' );
			expect( setSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'no stored value', () => {
		beforeEach( () => {
			getStoreStub.mockReturnValue( {} );
		} );

		describe( 'existing users', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( {
					localeSlug: 'en',
					date: DATE_BEFORE,
				} );
			} );
			test( 'should return default and skip store.set when allowExistingUsers is false', () => {
				expect( abtest( 'mockedTest' ) ).toBe( 'hide' );
				expect( setSpy ).not.toHaveBeenCalled();
			} );
			test( 'should call store.set when allowExistingUsers is true', () => {
				abtest( 'mockedTestAllowExisting' );
				expect( setSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'new users', () => {
			describe( 'English only users allowed (default)', () => {
				test( 'should call store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER,
					} );
					abtest( 'mockedTest' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
				test( 'should call store.set for new users with English-Canada settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en-ca',
						date: DATE_AFTER,
					} );
					abtest( 'mockedTest' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
				test( 'should return default and skip store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER,
					} );
					expect( abtest( 'mockedTest' ) ).toBe( 'hide' );
					expect( setSpy ).not.toHaveBeenCalled();
				} );
			} );

			describe( 'all locales allowed', () => {
				test( 'should call store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER,
					} );
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
				test( 'should call store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER,
					} );
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'specific locales only', () => {
				test( 'should return default and skip store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER,
					} );
					expect( abtest( 'multipeLocaleNotEn' ) ).toBe( 'hide' );
					expect( setSpy ).not.toHaveBeenCalled();
				} );
				test( 'should call store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER,
					} );
					abtest( 'multipeLocaleNotEn' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'fr locale only', () => {
				test( 'should return default and skip store.set for new users with non-french settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER,
					} );
					expect( abtest( 'mockedTestFrLocale' ) ).toBe( 'hide' );
					expect( setSpy ).not.toHaveBeenCalled();
				} );
				test( 'should call store.set for new users with fr settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'fr',
						date: DATE_AFTER,
					} );
					abtest( 'mockedTestFrLocale' );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'IL/IN countryCodeTargets only', () => {
				beforeEach( () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER,
					} );
				} );

				test( 'should return default and skip store.set for new users with no GeoLocation value', () => {
					abtest( 'mockedTestIlInCountryCodeTargets', null );
					expect( setSpy ).not.toHaveBeenCalled();
				} );
				test( 'should throw error if countryCodeTarget is set but geoLocation is not passed', () => {
					expect( () => abtest( 'mockedTestIlInCountryCodeTargets' ) ).toThrow(
						'Test config has countryCodeTargets, but no geoLocation passed to abtest function'
					);
				} );
				test( 'should return default and skip store.set for new users not from Israel', () => {
					const geoLocation = 'US';
					expect( abtest( 'mockedTestIlInCountryCodeTargets', geoLocation ) ).toBe( 'hide' );
					expect( setSpy ).not.toHaveBeenCalled();
				} );
				test( 'should call store.set for new users with from Israel', () => {
					const geoLocation = 'IL';
					abtest( 'mockedTestIlInCountryCodeTargets', geoLocation );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
				test( 'should call store.set for new users with from India', () => {
					const geoLocation = 'IN';
					abtest( 'mockedTestIlInCountryCodeTargets', geoLocation );
					expect( setSpy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );

		describe( 'new-user-no-locale', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( {
					localeSlug: false,
					date: DATE_AFTER,
				} );
			} );
			test( 'should call store.set for new users with no locale for en only test', () => {
				abtest( 'mockedTest' );
				expect( setSpy ).toHaveBeenCalledTimes( 1 );
			} );
			test( 'show return default and skip store.set for new users with no locale for fr test', () => {
				global.navigator.__defineGetter__( 'language', () => 'de' );
				expect( abtest( 'mockedTestFrLocale' ) ).toBe( 'hide' );
				expect( setSpy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'logged-out users', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( false );
			} );
			test( 'should call store.set for logged-out users with English locale', () => {
				global.navigator.__defineGetter__( 'language', () => 'en' );
				abtest( 'mockedTest' );
				expect( setSpy ).toHaveBeenCalledTimes( 1 );
			} );
			test( 'show return default and skip store.set for non-English navigator.language', () => {
				global.navigator.__defineGetter__( 'language', () => 'de' );
				expect( abtest( 'mockedTest' ) ).toBe( 'hide' );
				expect( setSpy ).not.toHaveBeenCalled();
			} );
			test( 'should return default and skip store.set for non-English navigator.languages primary preference', () => {
				global.navigator.__defineGetter__( 'languages', () => [ 'de' ] );
				expect( abtest( 'mockedTest' ) ).toBe( 'hide' );
				expect( setSpy ).not.toHaveBeenCalled();
			} );
			test( 'should return default and skip store.set for non-English IE10 userLanguage setting', () => {
				global.navigator.__defineGetter__( 'userLanguage', () => 'de' );
				expect( abtest( 'mockedTest' ) ).toBe( 'hide' );
				expect( setSpy ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );

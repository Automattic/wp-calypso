/** @jest-environment jsdom */
jest.mock( 'lib/abtest/active-tests', () => ( {
	mockedTest: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		allowExistingUsers: false
	},
	mockedTestAllowAnyLocale: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		localeTargets: 'any',
	},
	multipeLocaleNotEn: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		localeTargets: [ 'fr', 'de' ],
	},
	mockedTestFrLocale: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		localeTargets: [ 'fr' ],
	},
	mockedTestIlCountryCodeTarget: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		countryCodeTarget: 'IL',
	},
	mockedTestAllowExisting: {
		datestamp: '20160627',
		variations: {
			hide: 50,
			show: 50
		},
		defaultVariation: 'hide',
		allowExistingUsers: true
	},
} ) );
jest.mock( 'lib/user', () => {
	const getStub = jest.fn();

	const user = () => ( {
		get: getStub
	} );
	user.getUserStub = getStub;

	return user;
} );
jest.mock( 'store', () => ( {
	enabled: () => true,
	get: jest.fn(),
	set: require( 'sinon' ).spy(),
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import {
	get as getStoreStub,
	set as setSpy
} from 'store';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getUserStub } from 'lib/user';

const DATE_BEFORE = '2015-06-30T01:32:21.196Z';
const DATE_AFTER = '2016-06-30T01:32:21.196Z';

describe( 'abtest', () => {
	describe( 'stored value', () => {
		beforeEach( () => {
			getStoreStub.mockReturnValueOnce( { mockedTest_20160627: 'show' } );
			setSpy.reset();
		} );
		it( 'should return stored value and skip store.set for existing users', () => {
			getUserStub.mockReturnValueOnce( {
				localeSlug: 'en',
				date: DATE_BEFORE
			} );
			window.navigator = {
				language: 'en',
				languages: [ 'en' ]
			};
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
		it( 'should return stored value and skip store.set for any user, including new, non-English users', () => {
			getUserStub.mockReturnValueOnce( {
				localeSlug: 'de',
				date: DATE_AFTER
			} );
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
		it( 'should return stored value and skip store.set for a logged-out user', () => {
			getUserStub.mockReturnValueOnce( null );
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
	} );

	describe( 'no stored value', () => {
		beforeEach( () => {
			getStoreStub.mockReturnValue( {} );
			setSpy.reset();
		} );
		describe( 'existing users', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( {
					localeSlug: 'en',
					date: DATE_BEFORE
				} );
			} );
			it( 'should return default and skip store.set when allowExistingUsers is false', () => {
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
			it( 'should call store.set when allowExistingUsers is true', () => {
				abtest( 'mockedTestAllowExisting' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
		} );

		describe( 'new users', () => {
			describe( 'English only users allowed (default)', () => {
				it( 'should call store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER
					} );
					abtest( 'mockedTest' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should call store.set for new users with English-Canada settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en-ca',
						date: DATE_AFTER
					} );
					abtest( 'mockedTest' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should return default and skip store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER
					} );
					expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
			} );
			describe( 'all locales allowed', () => {
				it( 'should call store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER
					} );
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should call store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER
					} );
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'specific locales only', () => {
				it( 'should return default and skip store.set for new users with English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER
					} );
					expect( abtest( 'multipeLocaleNotEn' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should call store.set for new users with non-English settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER
					} );
					abtest( 'multipeLocaleNotEn' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'fr locale only', () => {
				it( 'should return default and skip store.set for new users with non-french settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'de',
						date: DATE_AFTER
					} );
					expect( abtest( 'mockedTestFrLocale' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should call store.set for new users with fr settings', () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'fr',
						date: DATE_AFTER
					} );
					abtest( 'mockedTestFrLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'IL countryCodeTarget only', () => {
				beforeEach( () => {
					getUserStub.mockReturnValue( {
						localeSlug: 'en',
						date: DATE_AFTER
					} );
				} );

				it( 'should return default and skip store.set for new users with no GeoLocation value', () => {
					abtest( 'mockedTestIlCountryCodeTarget', null );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should throw error if countryCodeTarget is set but geoLocation is not passed', () => {
					expect( () => abtest( 'mockedTestIlCountryCodeTarget' ) ).to.throw(
						'Test config has geoTarget, but no geoLocation passed to abtest function'
						);
				} );
				it( 'should return default and skip store.set for new users not from Israel', () => {
					const geoLocation = 'US';
					expect( abtest( 'mockedTestIlCountryCodeTarget', geoLocation ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should call store.set for new users with from Israel', () => {
					const geoLocation = 'IL';
					abtest( 'mockedTestIlCountryCodeTarget', geoLocation );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
		} );
		describe( 'new-user-no-locale', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( {
					localeSlug: false,
					date: DATE_AFTER
				} );
			} );
			it( 'should call store.set for new users with no locale for en only test', () => {
				abtest( 'mockedTest' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
			it( 'show return default and skip store.set for new users with no locale for fr test', () => {
				global.navigator.__defineGetter__( 'language', () => 'de' );
				expect( abtest( 'mockedTestFrLocale' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
		} );
		describe( 'logged-out users', () => {
			beforeEach( () => {
				getUserStub.mockReturnValue( false );
				setSpy.reset();
			} );
			it( 'should call store.set for logged-out users with English locale', () => {
				global.navigator.__defineGetter__( 'language', () => 'en' );
				abtest( 'mockedTest' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
			it( 'show return default and skip store.set for non-English navigator.language', () => {
				global.navigator.__defineGetter__( 'language', () => 'de' );
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
			it( 'should return default and skip store.set for non-English navigator.languages primary preference', () => {
				global.navigator.__defineGetter__( 'languages', () => [ 'de' ] );
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
			it( 'should return default and skip store.set for non-English IE10 userLanguage setting', () => {
				global.navigator.__defineGetter__( 'userLanguage', () => 'de' );
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
		} );
	} );
} );

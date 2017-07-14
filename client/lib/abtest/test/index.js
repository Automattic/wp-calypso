/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

const DATE_BEFORE = '2015-06-30T01:32:21.196Z';
const DATE_AFTER = '2016-06-30T01:32:21.196Z';

describe.skip( 'abtest', () => {
	let abtest;
	let mockedUser = {};
	let ABTests;
	const setSpy = sinon.spy( () => {} );

	useMockery( () => {
		require( 'lib/local-storage' )( global );
		mockery.registerMock( 'lib/abtest/active-tests', {
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
		} );
		mockery.registerMock( 'store', {
			enabled: () => true,
			get: () => {
				return ABTests;
			},
			set: setSpy,
		} );
		mockery.registerMock( 'lib/user', () => {
			return {
				get: () => mockedUser
			};
		} );
		abtest = require( 'lib/abtest' ).abtest;
	} );

	describe( 'stored value', () => {
		beforeEach( () => {
			ABTests = { mockedTest_20160627: 'show' };
			setSpy.reset();
		} );
		it( 'should return stored value and skip store.set for existing users', () => {
			mockedUser = {
				localeSlug: 'en',
				date: DATE_BEFORE
			};
			navigator = {
				language: 'en',
				languages: [ 'en' ]
			};
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
		it( 'should return stored value and skip store.set for any user, including new, non-English users', () => {
			mockedUser = {
				localeSlug: 'de',
				date: DATE_AFTER
			};
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
		it( 'should return stored value and skip store.set for a logged-out user', () => {
			mockedUser = null;
			expect( abtest( 'mockedTest' ) ).to.equal( 'show' );
			expect( setSpy ).not.to.have.been.called;
		} );
	} );

	describe( 'no stored value', () => {
		beforeEach( () => {
			ABTests = {};
			setSpy.reset();
		} );
		describe( 'existing users', () => {
			beforeEach( () => {
				mockedUser = {
					localeSlug: 'en',
					date: DATE_BEFORE
				};
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
			beforeEach( () => {
				mockedUser = {
					localeSlug: 'en',
					date: DATE_AFTER
				};
			} );
			describe( 'English only users allowed (default)', () => {
				it( 'should call store.set for new users with English settings', () => {
					abtest( 'mockedTest' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should call store.set for new users with English-Canada settings', () => {
					mockedUser.localeSlug = 'en-ca';
					abtest( 'mockedTest' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should return default and skip store.set for new users with non-English settings', () => {
					mockedUser.localeSlug = 'de';
					expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
			} );
			describe( 'all locales allowed', () => {
				it( 'should call store.set for new users with English settings', () => {
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
				it( 'should call store.set for new users with non-English settings', () => {
					mockedUser.localeSlug = 'de';
					abtest( 'mockedTestAllowAnyLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'specific locales only', () => {
				it( 'should return default and skip store.set for new users with English settings', () => {
					expect( abtest( 'multipeLocaleNotEn' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should call store.set for new users with non-English settings', () => {
					mockedUser.localeSlug = 'de';
					abtest( 'multipeLocaleNotEn' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'fr locale only', () => {
				it( 'should return default and skip store.set for new users with non-french settings', () => {
					mockedUser.localeSlug = 'de';
					expect( abtest( 'mockedTestFrLocale' ) ).to.equal( 'hide' );
					expect( setSpy ).not.to.have.been.called;
				} );
				it( 'should call store.set for new users with fr settings', () => {
					mockedUser.localeSlug = 'fr';
					abtest( 'mockedTestFrLocale' );
					expect( setSpy ).to.have.been.calledOnce;
				} );
			} );
			describe( 'IL countryCodeTarget only', () => {
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
				mockedUser = {
					localeSlug: false,
					date: DATE_AFTER
				};
			} );
			it( 'should call store.set for new users with no locale for en only test', () => {
				abtest( 'mockedTest' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
			it( 'show return default and skip store.set for new users with no locale for fr test', () => {
				navigator.language = 'de';
				expect( abtest( 'mockedTestFrLocale' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
		} );
		describe( 'logged-out users', () => {
			beforeEach( () => {
				mockedUser = false;
				setSpy.reset();
				navigator = {
					language: 'en',
					languages: [ 'en' ]
				};
			} );
			it( 'should call store.set for logged-out users with English locale', () => {
				abtest( 'mockedTest' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
			it( 'show return default and skip store.set for non-English navigator.language', () => {
				navigator.language = 'de';
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
			it( 'should return default and skip store.set for non-English navigator.languages primary preference', () => {
				navigator.languages = [ 'de' ];
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
			it( 'should return default and skip store.set for non-English IE10 userLanguage setting', () => {
				navigator = {
					userLanguage: 'de'
				};
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
				expect( setSpy ).not.to.have.been.called;
			} );
		} );
	} );
} );

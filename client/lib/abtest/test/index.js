/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

const DATE_BEFORE = '2015-06-30T01:32:21.196Z';
const DATE_AFTER = '2016-06-30T01:32:21.196Z';

describe( 'abtest', () => {
	let abtest;
	let mockedUser = {};
	let ABTests;
	const setSpy = sinon.spy( () => {} );

	useFakeDom();
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
			it( 'should call store.set for new users with English settings', () => {
				abtest( 'mockedTest' );
				expect( setSpy ).to.have.been.calledOnce;
			} );
			it( 'should return default and skip store.set for new users with non-English settings', () => {
				mockedUser.localeSlug = 'de';
				expect( abtest( 'mockedTest' ) ).to.equal( 'hide' );
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

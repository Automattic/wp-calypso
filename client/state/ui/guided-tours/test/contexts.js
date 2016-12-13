/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'selectors', () => {
	let hasUserRegisteredBefore;

	useFakeDom();

	useMockery( mockery => {
		mockery.registerSubstitute(
				'layout/guided-tours/config',
				'state/ui/guided-tours/test/fixtures/config' );

		const contexts = require( '../contexts' );
		hasUserRegisteredBefore = contexts.hasUserRegisteredBefore;
	} );

	describe( '#hasUserRegisteredBefore', () => {
		const cutoff = new Date( '2015-10-18T17:14:52+00:00' );

		const oldUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: '2014-10-18T17:14:52+00:00' }
				}
			},
		};

		const newUser = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: '2016-10-18T17:14:52+00:00' }
				}
			},
		};

		it( 'should return true for users registered before the cut-off date', () => {
			expect( hasUserRegisteredBefore( cutoff )( oldUser ) ).to.be.true;
		} );

		it( 'should return false for users registered after the cut-off date', () => {
			expect( hasUserRegisteredBefore( cutoff )( newUser ) ).to.be.false;
		} );
	} );
} );

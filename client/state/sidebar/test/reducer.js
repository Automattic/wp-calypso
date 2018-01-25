/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { route, parentRoute } from '../reducer';
import { SIDEBAR_ROUTE_SET } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'route', 'parentRoute' ] );
	} );

	describe( '#route()', () => {
		test( 'should default to an empty string', () => {
			const actual = route( undefined, {} );
			const expected = '';

			expect( actual ).to.eql( expected );
		} );

		test( 'set sidebar.route to given route value', () => {
			const action = {
				type: SIDEBAR_ROUTE_SET,
				route: 'some-sidebar-route',
			};
			const actual = route( undefined, action );
			const expected = 'some-sidebar-route';

			expect( actual ).to.eql( expected );
		} );
	} );

	describe( '#parentRoute()', () => {
		test( 'should default to an empty string', () => {
			const actual = route( undefined, {} );
			const expected = '';

			expect( actual ).to.eql( expected );
		} );

		test( 'set sidebar.parentRoute to given parentRoute value', () => {
			const action = {
				type: SIDEBAR_ROUTE_SET,
				parentRoute: 'some-parent-route',
			};
			const actual = parentRoute( undefined, action );
			const expected = 'some-parent-route';

			expect( actual ).to.eql( expected );
		} );
	} );
} );

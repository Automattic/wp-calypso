/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setSidebarRoute } from '../actions';
import { SIDEBAR_ROUTE_SET } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	describe( '#setSidebarRoute()', () => {
		const route = 'some-sidebar-route';

		test( 'should return a request action object when called', () => {
			setSidebarRoute( route )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SIDEBAR_ROUTE_SET,
				route: 'some-sidebar-route',
			} );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getActionLog, getLastAction } from '../selectors';
import { GUIDED_TOUR_UPDATE, ROUTE_SET } from 'calypso/state/action-types';

describe( 'selectors', () => {
	describe( 'getActionLog', () => {
		test( 'should initially return one empty list', () => {
			const log = getActionLog( {
				ui: {
					actionLog: [],
				},
			} );

			expect( log ).to.eql( [] );
		} );

		test( 'should retrieve all actions from the log', () => {
			const actions = [
				{
					type: GUIDED_TOUR_UPDATE,
					shouldShow: false,
				},
				{
					type: ROUTE_SET,
					path: '/menus/77203074',
				},
			];
			const log = getActionLog( {
				ui: {
					actionLog: actions,
				},
			} );

			expect( log ).to.eql( actions );
		} );
	} );

	describe( 'getLastAction', () => {
		test( 'should return undefined for an empty action log', () => {
			const action = getLastAction( {
				ui: {
					actionLog: [],
				},
			} );

			expect( action ).to.be.false;
		} );

		test( 'should retrieve the last action from the action log', () => {
			const navToMenus = { type: 'ROUTE_SET', path: '/menus', timestamp: 0 };
			const navToDesign = { type: 'ROUTE_SET', path: '/themes', timestamp: 1 };
			const action = getLastAction( {
				ui: {
					actionLog: [ navToMenus, navToDesign ],
				},
			} );

			expect( action ).to.equal( navToDesign );
		} );
	} );
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getActionLog,
	getLastAction,
} from '../selectors';

import {
	GUIDED_TOUR_UPDATE,
	ROUTE_SET,
} from 'state/action-types';

describe( 'selectors', () => {
	describe( 'getActionLog', () => {
		it( 'should initially return one empty list', () => {
			const log = getActionLog( {
				ui: {
					actionLog: [],
				}
			} );

			expect( log ).to.eql( [] );
		} );

		it( 'should retrieve all actions from the log', () => {
			const actions = [
				{
					type: GUIDED_TOUR_UPDATE,
					shouldShow: false,
				},
				{
					type: ROUTE_SET,
					path: '/menus/77203074',
				}
			];
			const log = getActionLog( {
				ui: {
					actionLog: actions,
				},
			} );

			expect( log ).to.eql( actions );
		} );
	} );

	describe( 'getLastAction', () => {
		it( 'should return undefined for an empty action log', () => {
			const action = getLastAction( {
				ui: {
					actionLog: [],
				}
			} );

			expect( action ).to.be.false;
		} );

		it( 'should retrieve the last action from the action log', () => {
			const navToMenus = { type: 'ROUTE_SET', path: '/menus', timestamp: 0 };
			const navToDesign = { type: 'ROUTE_SET', path: '/themes', timestamp: 1 };
			const action = getLastAction( {
				ui: {
					actionLog: [ navToMenus, navToDesign ],
				}
			} );

			expect( action ).to.equal( navToDesign );
		} );
	} );
} );

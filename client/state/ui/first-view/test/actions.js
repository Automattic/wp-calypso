/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { hideView } from '../actions';
import { FIRST_VIEW_HIDE, ROUTE_SET } from 'state/action-types';

describe( 'actions', () => {
	const spy = sinon.spy();
	const getState = () => ( {
		preferences: {
			remoteValues: {
				firstViewHistory: []
			}
		},
		ui: {
			actionLog: [
				{
					type: ROUTE_SET,
					path: '/stats',
				},
			]
		}
	} );

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#hideView()', () => {
		it( 'should dispatch hide action when thunk triggered', () => {
			hideView( { view: 'stats', enabled: false } )( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_HIDE,
				view: 'stats'
			} );
		} );
	} );
} );

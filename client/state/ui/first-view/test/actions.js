/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_HIDE
} from 'state/action-types';
import {
	hideView
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();
	const getState = () => ( {
		preferences: {
			values: {
				firstViewHistory: []
			}
		},
		ui: {
			actionLog: []
		}
	} );

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#hideView()', () => {
		it( 'should dispatch hide action when thunk triggered', () => {
			hideView( { view: 'stats', enabled: false } ) ( spy, getState );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_HIDE,
				view: 'stats'
			} );
		} );
	} );
} );

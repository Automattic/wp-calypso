/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW
} from 'state/action-types';
import {
	enableView,
	disableView,
	showView,
	hideView
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#enableView()', () => {
		it( 'should dispatch enable action when thunk triggered', () => {
			enableView( { view: 'stats' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_ENABLE,
				view: 'stats'
			} );
		} );
	} );

	describe( '#disableView()', () => {
		it( 'should dispatch disable action when thunk triggered', () => {
			disableView( { view: 'stats' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_DISABLE,
				view: 'stats'
			} );
		} );
	} );

	describe( '#showView()', () => {
		it( 'should dispatch show action when thunk triggered', () => {
			showView( { view: 'stats' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_SHOW,
				view: 'stats'
			} );
		} );
	} );

	describe( '#hideView()', () => {
		it( 'should dispatch hide action when thunk triggered', () => {
			hideView( { view: 'stats' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: FIRST_VIEW_HIDE,
				view: 'stats'
			} );
		} );
	} );
} );

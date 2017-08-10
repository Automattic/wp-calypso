/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
} from 'state/action-types';
import layoutFocus from '../reducer';

describe( 'reducer', () => {
	it( 'starts with current focus set to "content"', function() {
		const action = { type: 'FAKE_ACTION' };
		const state = layoutFocus( undefined, action );
		expect( state.current ).to.equal( 'content' );
	} );

	describe( 'LAYOUT_FOCUS_SET', () => {
		it( 'sets the current focus area to the passed value', function() {
			const action = { type: LAYOUT_FOCUS_SET, area: 'sidebar' };
			const state = layoutFocus( undefined, action );
			expect( state.current ).to.equal( 'sidebar' );
		} );

		it( 'does not set the current focus area if the value is the same', function() {
			const action = { type: LAYOUT_FOCUS_SET, area: 'content' };
			const initialState = { current: 'content', next: null };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );

	describe( 'LAYOUT_NEXT_FOCUS_SET', () => {
		it( 'sets the next focus area to the passed value', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'sidebar' };
			const state = layoutFocus( undefined, action );
			expect( state.next ).to.equal( 'sidebar' );
		} );

		it( 'does not change the current focus area', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'sidebar' };
			const initialState = deepFreeze( { current: 'content', next: null } );
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( initialState.current );
		} );

		it( 'does not set the next focus area if the value is the same', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'preview' };
			const initialState = { current: 'content', next: 'preview' };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );

	describe( 'LAYOUT_NEXT_FOCUS_ACTIVATE', () => {
		it( 'sets the current focus area to the next value if one exists', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( 'sidebar' );
		} );

		it( 'sets the current focus area to "content" if no next state exists', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'preview', next: null };
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( 'content' );
		} );

		it( 'sets the next focus area to null when complete', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.next ).to.equal( null );
		} );

		it( 'sets the next focus area to null when complete even if next and current are the same', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'sidebar', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.next ).to.equal( null );
		} );

		it( 'does not take any action if the current focus is already "content" and no next state exists', function() {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: null };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );
} );

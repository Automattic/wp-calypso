/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import layoutFocus from '../reducer';
import {
	LAYOUT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_SET,
	LAYOUT_NEXT_FOCUS_ACTIVATE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'starts with current focus set to "content"', () => {
		const action = { type: 'FAKE_ACTION' };
		const state = layoutFocus( undefined, action );
		expect( state.current ).to.equal( 'content' );
	} );

	describe( 'LAYOUT_FOCUS_SET', () => {
		test( 'sets the current focus area to the passed value', () => {
			const action = { type: LAYOUT_FOCUS_SET, area: 'sidebar' };
			const state = layoutFocus( undefined, action );
			expect( state.current ).to.equal( 'sidebar' );
		} );

		test( 'does not set the current focus area if the value is the same', () => {
			const action = { type: LAYOUT_FOCUS_SET, area: 'content' };
			const initialState = { current: 'content', next: null };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );

	describe( 'LAYOUT_NEXT_FOCUS_SET', () => {
		test( 'sets the next focus area to the passed value', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'sidebar' };
			const state = layoutFocus( undefined, action );
			expect( state.next ).to.equal( 'sidebar' );
		} );

		test( 'does not change the current focus area', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'sidebar' };
			const initialState = deepFreeze( { current: 'content', next: null } );
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( initialState.current );
		} );

		test( 'does not set the next focus area if the value is the same', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_SET, area: 'preview' };
			const initialState = { current: 'content', next: 'preview' };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );

	describe( 'LAYOUT_NEXT_FOCUS_ACTIVATE', () => {
		test( 'sets the current focus area to the next value if one exists', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( 'sidebar' );
		} );

		test( 'sets the current focus area to "content" if no next state exists', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'preview', next: null };
			const state = layoutFocus( initialState, action );
			expect( state.current ).to.equal( 'content' );
		} );

		test( 'sets the next focus area to null when complete', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.next ).to.equal( null );
		} );

		test( 'sets the next focus area to null when complete even if next and current are the same', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'sidebar', next: 'sidebar' };
			const state = layoutFocus( initialState, action );
			expect( state.next ).to.equal( null );
		} );

		test( 'does not take any action if the current focus is already "content" and no next state exists', () => {
			const action = { type: LAYOUT_NEXT_FOCUS_ACTIVATE };
			const initialState = { current: 'content', next: null };
			const state = layoutFocus( initialState, action );
			expect( state ).to.equal( initialState );
		} );
	} );
} );

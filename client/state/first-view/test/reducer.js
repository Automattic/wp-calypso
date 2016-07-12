/**
 * External dependencies
 */
/*import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
/*import {
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_DISABLED_SET,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
	FIRST_VIEW_VISIBLE_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	firstView,
} from '../reducer';

describe( 'reducer', () => {

	describe( 'DESERIALIZE', () => {
		it( 'should default to the initial state', () => {
			const state = firstView( undefined, { type: DESERIALIZE } );

			expect( state ).to.eql( { disabled: [], visible: [] } );
		} );

		it( 'should restore from persisted state', () => {
			const state = firstView( { disabled: [ 'stats' ] }, { type: DESERIALIZE } );

			expect( state ).to.eql( { disabled: [ 'stats' ], visible: [] } );
		} );

		it( 'should ignore visibility key', () => {
			const state = firstView( { disabled: [ 'stats' ], visible: [ 'people' ] }, { type: DESERIALIZE } );

			expect( state ).to.eql( { disabled: [ 'stats' ], visible: [] } );
		} );

		it( 'should return the initial state if schema validation fails', () => {
			const state = firstView( { disabled: 42 }, { type: DESERIALIZE } );

			expect( state ).to.eql( { disabled: [], visible: [] } );
		} );
	} );

	describe( 'SERIALIZE', () => {
		it( 'should default to the initial state', () => {
			const state = firstView( undefined, { type: SERIALIZE } );

			expect( state ).to.eql( { disabled: [], visible: [] } );
		} );

		it( 'should persist state', () => {
			const state = firstView( { disabled: [ 'stats' ] }, { type: SERIALIZE } );

			expect( state ).to.eql( { disabled: [ 'stats' ], visible: [] } );
		} );

		it( 'should ignore visibility key', () => {
			const state = firstView( { disabled: [ 'stats' ], visible: [ 'people' ] }, { type: SERIALIZE } );

			expect( state ).to.eql( { disabled: [ 'stats' ], visible: [] } );
		} );

		it( 'should return the initial state if schema validation fails', () => {
			const state = firstView( { disabled: 42 }, { type: SERIALIZE } );

			expect( state ).to.eql( { disabled: [], visible: [] } );
		} );
	} );

	describe( 'FIRST_VIEW_DISABLED_SET', () => {
		it( 'should set the disabled views', () => {
			const state = firstView( {}, { type: FIRST_VIEW_DISABLED_SET, views: [ 'stats' ] } );

			expect( state ).to.eql( { disabled: [ 'stats' ] } );
		} );
	} );


	describe( 'FIRST_VIEW_VISIBLE_SET', () => {
		it( 'should set the visible views', () => {
			const state = firstView( {}, { type: FIRST_VIEW_VISIBLE_SET, views: [ 'stats' ] } );

			expect( state ).to.eql( { visible: [ 'stats' ] } );
		} );
	} );

	describe( 'FIRST_VIEW_ENABLE', () => {
		it( 'should enable the first view', () => {
			const state = firstView( { disabled: [ 'stats', 'people' ] }, { type: FIRST_VIEW_ENABLE, view: 'stats' } );

			expect( state ).to.eql( { disabled: [ 'people' ] } );
		} );

		it( 'should do nothing if the first view is already enabled', () => {
			const state = firstView( { disabled: [ 'people' ] }, { type: FIRST_VIEW_ENABLE, view: 'stats' } );

			expect( state ).to.eql( { disabled: [ 'people' ] } );
		} );
	} );

	describe( 'FIRST_VIEW_DISABLE', () => {
		it( 'should disable the first view', () => {
			const state = firstView( { disabled: [ 'people' ] }, { type: FIRST_VIEW_DISABLE, view: 'stats' } );

			expect( state.disabled ).to.have.members( [ 'stats', 'people' ] );
		} );

		it( 'should do nothing if the first view is already disabled', () => {
			const state = firstView( { disabled: [ 'stats', 'people' ] }, { type: FIRST_VIEW_DISABLE, view: 'stats' } );

			expect( state.disabled ).to.have.members( [ 'stats', 'people' ] );
		} );
	} );

	describe( 'FIRST_VIEW_HIDE', () => {
		it( 'should hide the first view', () => {
			const state = firstView( { visible: [ 'stats' ] }, { type: FIRST_VIEW_HIDE, view: 'stats' } );

			expect( state ).to.eql( { visible: [] } );
		} );

		it( 'should do nothing if the first view is already hidden', () => {
			const state = firstView( { visible: [] }, { type: FIRST_VIEW_HIDE, view: 'stats' } );

			expect( state ).to.eql( { visible: [] } );
		} );
	} );

	describe( 'FIRST_VIEW_SHOW', () => {
		it( 'should show the first view', () => {
			const state = firstView( { visible: [ 'stats' ] }, { type: FIRST_VIEW_SHOW, view: 'people' } );

			expect( state.visible ).to.have.members( [ 'stats', 'people' ] );
		} );

		it( 'should do noting if the first view is already shown', () => {
			const state = firstView( { visible: [ 'stats' ] }, { type: FIRST_VIEW_SHOW, view: 'stats' } );

			expect( state.visible ).to.eql( [ 'stats' ] );
		} );
	} );
} );
*/
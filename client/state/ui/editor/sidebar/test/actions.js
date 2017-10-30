/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { openEditorSidebar, closeEditorSidebar, setNestedSidebar } from '../actions';
import { EDITOR_NESTED_SIDEBAR_SET, LAYOUT_FOCUS_SET } from 'state/action-types';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#openEditorSidebar', () => {
		test( 'should dispatch setLayoutFocus action with a value of "sidebar"', () => {
			const expectedAction = { area: 'sidebar', type: LAYOUT_FOCUS_SET };

			openEditorSidebar()( spy );

			expect( spy ).to.have.been.calledWith( expectedAction );
		} );
	} );

	describe( '#closeEditorSidebar', () => {
		test( 'should dispatch setLayoutFocus action with a value of "content"', () => {
			const expectedAction = { area: 'content', type: LAYOUT_FOCUS_SET };

			closeEditorSidebar()( spy );

			expect( spy ).to.have.been.calledWith( expectedAction );
		} );
	} );

	describe( '#setNestedSidebar', () => {
		test( 'should return an action with the passed target value', () => {
			const target = 'TEST_TARGET';
			const action = setNestedSidebar( target );
			const expectedAction = {
				type: EDITOR_NESTED_SIDEBAR_SET,
				target,
			};

			expect( action ).to.eql( expectedAction );
		} );
	} );
} );

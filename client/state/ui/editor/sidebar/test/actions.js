/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon, { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { openEditorSidebar, closeEditorSidebar, setNestedSidebar } from '../actions';
import { EDITOR_NESTED_SIDEBAR_SET, LAYOUT_FOCUS_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( '#openEditorSidebar', () => {
		test( 'should dispatch setLayoutFocus action with a value of "sidebar"', () => {
			const dispatch = spy();
			const expectedAction = { area: 'sidebar', type: LAYOUT_FOCUS_SET };

			openEditorSidebar()( dispatch );

			expect( dispatch ).to.have.been.calledWith( sinon.match( expectedAction ) );
		} );
	} );

	describe( '#closeEditorSidebar', () => {
		test( 'should dispatch setLayoutFocus action with a value of "content"', () => {
			const dispatch = spy();
			const expectedAction = { area: 'content', type: LAYOUT_FOCUS_SET };

			closeEditorSidebar()( dispatch );

			expect( dispatch ).to.have.been.calledWith( sinon.match( expectedAction ) );
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

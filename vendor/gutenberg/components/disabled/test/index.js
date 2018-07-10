/**
 * External dependencies
 */
import TestUtils from 'react-dom/test-utils';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Disabled from '../';

jest.mock( '@wordpress/dom', () => {
	const focus = require.requireActual( '@wordpress/dom' ).focus;

	return {
		focus: {
			...focus,
			focusable: {
				...focus.focusable,
				find( context ) {
					// In JSDOM, all elements have zero'd widths and height.
					// This is a metric for focusable's `isVisible`, so find
					// and apply an arbitrary non-zero width.
					[ ...context.querySelectorAll( '*' ) ].forEach( ( element ) => {
						Object.defineProperties( element, {
							offsetWidth: {
								get: () => 1,
							},
						} );
					} );

					return focus.focusable.find( ...arguments );
				},
			},
		},
	};
} );

describe( 'Disabled', () => {
	let MutationObserver;

	beforeAll( () => {
		MutationObserver = window.MutationObserver;
		window.MutationObserver = function() {};
		window.MutationObserver.prototype = {
			observe() {},
			disconnect() {},
		};
	} );

	afterAll( () => {
		window.MutationObserver = MutationObserver;
	} );

	const Form = () => <form><input /><div contentEditable tabIndex="0" /></form>;

	it( 'will disable all fields', () => {
		const wrapper = TestUtils.renderIntoDocument( <Disabled><Form /></Disabled> );

		const input = TestUtils.findRenderedDOMComponentWithTag( wrapper, 'input' );
		const div = TestUtils.scryRenderedDOMComponentsWithTag( wrapper, 'div' )[ 1 ];

		expect( input.hasAttribute( 'disabled' ) ).toBe( true );
		expect( div.getAttribute( 'contenteditable' ) ).toBe( 'false' );
		expect( div.hasAttribute( 'tabindex' ) ).toBe( false );
		expect( div.hasAttribute( 'disabled' ) ).toBe( false );
	} );

	it( 'should cleanly un-disable via reconciliation', () => {
		// If this test suddenly starts failing, it means React has become
		// smarter about reusing children into grandfather element when the
		// parent is dropped, so we'd need to find another way to restore
		// original form state.
		// Using state for this test for easier manipulation of the child props.
		class MaybeDisable extends Component {
			constructor() {
				super( ...arguments );
				this.state = { isDisabled: true };
			}

			render() {
				return this.state.isDisabled ?
					<Disabled><Form /></Disabled> :
					<Form />;
			}
		}

		const wrapper = TestUtils.renderIntoDocument( <MaybeDisable /> );
		wrapper.setState( { isDisabled: false } );

		const input = TestUtils.findRenderedDOMComponentWithTag( wrapper, 'input' );
		const div = TestUtils.findRenderedDOMComponentWithTag( wrapper, 'div' );

		expect( input.hasAttribute( 'disabled' ) ).toBe( false );
		expect( div.getAttribute( 'contenteditable' ) ).toBe( 'true' );
		expect( div.hasAttribute( 'tabindex' ) ).toBe( true );
	} );

	// Ideally, we'd have two more test cases here:
	//
	//  - it( 'will disable all fields on component render change' )
	//  - it( 'will disable all fields on sneaky DOM manipulation' )
	//
	// Alas, JSDOM does not support MutationObserver:
	//
	//  https://github.com/jsdom/jsdom/issues/639

	describe( 'Consumer', () => {
		class DisabledStatus extends Component {
			render() {
				return (
					<p>
						<Disabled.Consumer>
							{ ( isDisabled ) => isDisabled ? 'Disabled' : 'Not disabled' }
						</Disabled.Consumer>
					</p>
				);
			}
		}

		test( 'lets components know that they\'re disabled via context', () => {
			const wrapper = TestUtils.renderIntoDocument( <Disabled><DisabledStatus /></Disabled> );
			const wrapperElement = TestUtils.findRenderedDOMComponentWithTag( wrapper, 'p' );
			expect( wrapperElement.textContent ).toBe( 'Disabled' );
		} );

		test( 'lets components know that they\'re not disabled via context', () => {
			const wrapper = TestUtils.renderIntoDocument( <DisabledStatus /> );
			const wrapperElement = TestUtils.findRenderedDOMComponentWithTag( wrapper, 'p' );
			expect( wrapperElement.textContent ).toBe( 'Not disabled' );
		} );
	} );
} );

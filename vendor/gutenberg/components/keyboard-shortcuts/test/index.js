/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import KeyboardShortcuts from '../';

describe( 'KeyboardShortcuts', () => {
	afterEach( () => {
		while ( document.body.firstChild ) {
			document.body.removeChild( document.body.firstChild );
		}
	} );

	function keyPress( which, target ) {
		[ 'keydown', 'keypress', 'keyup' ].forEach( ( eventName ) => {
			const event = new window.Event( eventName, { bubbles: true } );
			event.keyCode = which;
			event.which = which;
			target.dispatchEvent( event );
		} );
	}

	it( 'should capture key events', () => {
		const spy = jest.fn();
		mount(
			<KeyboardShortcuts
				shortcuts={ {
					d: spy,
				} } />
		);

		keyPress( 68, document );

		expect( spy ).toHaveBeenCalled();
	} );

	it( 'should capture key events globally', () => {
		const spy = jest.fn();
		const attachNode = document.createElement( 'div' );
		document.body.appendChild( attachNode );

		const wrapper = mount(
			<div>
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						d: spy,
					} } />
				<textarea></textarea>
			</div>,
			{ attachTo: attachNode }
		);

		keyPress( 68, wrapper.find( 'textarea' ).getDOMNode() );

		expect( spy ).toHaveBeenCalled();
	} );

	it( 'should capture key events on specific event', () => {
		const spy = jest.fn();
		const attachNode = document.createElement( 'div' );
		document.body.appendChild( attachNode );

		const wrapper = mount(
			<div>
				<KeyboardShortcuts
					eventName="keyup"
					shortcuts={ {
						d: spy,
					} } />
				<textarea></textarea>
			</div>,
			{ attachTo: attachNode }
		);

		keyPress( 68, wrapper.find( 'textarea' ).getDOMNode() );

		expect( spy ).toHaveBeenCalled();
		expect( spy.mock.calls[ 0 ][ 0 ].type ).toBe( 'keyup' );
	} );

	it( 'should capture key events on children', () => {
		const spy = jest.fn();
		const attachNode = document.createElement( 'div' );
		document.body.appendChild( attachNode );

		const wrapper = mount(
			<div>
				<KeyboardShortcuts
					shortcuts={ {
						d: spy,
					} }
				>
					<textarea></textarea>
				</KeyboardShortcuts>
				<textarea></textarea>
			</div>,
			{ attachTo: attachNode }
		);

		const textareas = wrapper.find( 'textarea' );

		// Outside scope
		keyPress( 68, textareas.at( 1 ).getDOMNode() );
		expect( spy ).not.toHaveBeenCalled();

		// Inside scope
		keyPress( 68, textareas.at( 0 ).getDOMNode() );
		expect( spy ).toHaveBeenCalled();
	} );
} );

/**
 * External dependencies
 */
import { mount } from 'enzyme';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { ENTER, ESCAPE, UP, DOWN, SPACE } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import EnhancedAutocomplete, { Autocomplete } from '../';

jest.useFakeTimers();

class FakeEditor extends Component {
	// we want to change the editor contents manually so don't let react update it
	shouldComponentUpdate() {
		return false;
	}
	render() {
		const { children, ...other } = this.props;
		return (
			<div
				className="fake-editor"
				contentEditable
				suppressContentEditableWarning
				{ ...other }>
				{ children }
			</div>
		);
	}
}

function makeAutocompleter( completers, {
	AutocompleteComponent = Autocomplete,
	onReplace = noop,
} = {} ) {
	return mount(
		<AutocompleteComponent instanceId="1"
			completers={ completers }
			onReplace={ onReplace }
		>
			{ ( { isExpanded, listBoxId, activeId } ) => (
				<FakeEditor
					aria-autocomplete="list"
					aria-expanded={ isExpanded }
					aria-owns={ listBoxId }
					aria-activedescendant={ activeId }
				/>
			) }
		</AutocompleteComponent>
	);
}

/**
 * Create a text node.
 *
 * @param {string} text Text of text node.

 * @return {Node} A text node.
 */
function tx( text ) {
	return document.createTextNode( text );
}

/**
 * Create a paragraph node with the arguments as children.

 * @return {Node} A paragraph node.
 */
function par( /* arguments */ ) {
	const p = document.createElement( 'p' );
	Array.from( arguments ).forEach( ( element ) => p.appendChild( element ) );
	return p;
}

/**
 * Simulate typing into the fake editor by updating the content and simulating
 * an input event. It also updates the data-cursor attribute which is used to
 * simulate the cursor position in the test mocks.
 *
 * @param {*}              wrapper        Enzyme wrapper around react node
 *                                        containing  a FakeEditor.
 * @param {Array.<Node>}   nodeList       Array of dom nodes.
 * @param {Array.<number>} cursorPosition Array specifying the child indexes and
 *                                        offset of the cursor.
 */
function simulateInput( wrapper, nodeList, cursorPosition ) {
	// update the editor content
	const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
	fakeEditor.innerHTML = '';
	nodeList.forEach( ( element ) => fakeEditor.appendChild( element ) );
	if ( cursorPosition && cursorPosition.length >= 1 ) {
		fakeEditor.setAttribute( 'data-cursor', cursorPosition.join( ',' ) );
	} else {
		fakeEditor.removeAttribute( 'data-cursor' );
	}
	// simulate input event
	wrapper.find( '.fake-editor' ).simulate( 'input', {
		target: fakeEditor,
	} );
	wrapper.update();
}

/**
 * Fire a native keydown event on the fake editor in the wrapper.
 *
 * @param {*} wrapper The wrapper containing the FakeEditor where the event will
 *                    be dispatched.
 * @param {*} keyCode The keycode of the key event.
 */
function simulateKeydown( wrapper, keyCode ) {
	const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
	const event = new KeyboardEvent( 'keydown', { keyCode } ); // eslint-disable-line
	fakeEditor.dispatchEvent( event );
	wrapper.update();
}

/**
 * Check that the autocomplete matches the initial state.
 *
 * @param {*} wrapper The enzyme react wrapper.
 */
function expectInitialState( wrapper ) {
	expect( wrapper.state( 'open' ) ).toBeUndefined();
	expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
	expect( wrapper.state( 'query' ) ).toBeUndefined();
	expect( wrapper.state( 'search' ) ).toEqual( /./ );
	expect( wrapper.state( 'filteredOptions' ) ).toEqual( [] );
	expect( wrapper.find( 'Popover' ) ).toHaveLength( 0 );
	expect( wrapper.find( '.components-autocomplete__result' ) ).toHaveLength( 0 );
}

describe( 'Autocomplete', () => {
	const options = [
		{
			id: 1,
			label: 'Bananas',
			keywords: [ 'fruit' ],
		},
		{
			id: 2,
			label: 'Apple',
			keywords: [ 'fruit' ],
		},
		{
			id: 3,
			label: 'Avocado',
			keywords: [ 'fruit' ],
		},
	];

	const basicCompleter = {
		options,
		getOptionLabel: ( option ) => option.label,
		getOptionKeywords: ( option ) => option.keywords,
		isOptionDisabled: ( option ) => option.isDisabled,
	};

	const slashCompleter = {
		triggerPrefix: '/',
		...basicCompleter,
	};

	let realGetCursor, realCreateRange;

	beforeAll( () => {
		realGetCursor = Autocomplete.prototype.getCursor;

		Autocomplete.prototype.getCursor = jest.fn( ( container ) => {
			if ( container.hasAttribute( 'data-cursor' ) ) {
				// the cursor position is specified by a list of child indexes (relative to the container) and the offset
				const path = container.getAttribute( 'data-cursor' ).split( ',' ).map( ( val ) => parseInt( val, 10 ) );
				const offset = path.pop();
				let node = container;
				for ( let i = 0; i < path.length; i++ ) {
					node = container.childNodes[ path[ i ] ];
				}
				return { node, offset };
			}
			// by default we say the cursor is at the end of the editor
			return {
				node: container,
				offset: container.childNodes.length,
			};
		} );

		realCreateRange = Autocomplete.prototype.createRange;

		Autocomplete.prototype.createRange = jest.fn( ( startNode, startOffset, endNode, endOffset ) => {
			const fakeBounds = { x: 0, y: 0, width: 1, height: 1, top: 0, right: 1, bottom: 1, left: 0 };
			return {
				startNode,
				startOffset,
				endNode,
				endOffset,
				getClientRects: () => [ fakeBounds ],
				getBoundingClientRect: () => fakeBounds,
			};
		} );
	} );

	afterAll( () => {
		Autocomplete.prototype.getCursor = realGetCursor;
		Autocomplete.prototype.createRange = realCreateRange;
	} );

	describe( 'render()', () => {
		it( 'renders children', () => {
			const wrapper = makeAutocompleter( [] );
			expect( wrapper.state().open ).toBeUndefined();
			expect( wrapper.childAt( 0 ).hasClass( 'components-autocomplete' ) ).toBe( true );
			expect( wrapper.find( '.fake-editor' ) ).toHaveLength( 1 );
		} );

		it( 'opens on absent trigger prefix search', ( done ) => {
			const wrapper = makeAutocompleter( [ basicCompleter ] );
			expectInitialState( wrapper );
			// simulate typing 'b'
			simulateInput( wrapper, [ par( tx( 'b' ) ) ] );
			// wait for async popover display
			process.nextTick( function() {
				wrapper.update();
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( 'b' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)b/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
				expect( wrapper.find( 'Popover' ).prop( 'focusOnMount' ) ).toBe( false );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'does not render popover as open if no results', ( done ) => {
			const wrapper = makeAutocompleter( [ basicCompleter ] );
			expectInitialState( wrapper );
			// simulate typing 'zzz'
			simulateInput( wrapper, [ tx( 'zzz' ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// now check that we've opened the popup and filtered the options to empty
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'query' ) ).toEqual( 'zzz' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)zzz/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 0 );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 0 );
				done();
			} );
		} );

		it( 'does not open without trigger prefix', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			expectInitialState( wrapper );
			// simulate typing 'b'
			simulateInput( wrapper, [ par( tx( 'b' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// now check that the popup is not open
				expectInitialState( wrapper );
				done();
			} );
		} );

		it( 'opens on trigger prefix search', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// now check that we've opened the popup and filtered the options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( '' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 3 );
				done();
			} );
		} );

		it( 'searches by keywords', ( done ) => {
			const wrapper = makeAutocompleter( [ basicCompleter ] );
			expectInitialState( wrapper );
			// simulate typing fruit (split over 2 text nodes because these things happen)
			simulateInput( wrapper, [ par( tx( 'fru' ), tx( 'it' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// now check that we've opened the popup and filtered the options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( 'fruit' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)fruit/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 3 );
				done();
			} );
		} );

		it( 'closes when search ends (whitespace)', ( done ) => {
			const wrapper = makeAutocompleter( [ basicCompleter ] );
			expectInitialState( wrapper );
			// simulate typing 'a'
			simulateInput( wrapper, [ tx( 'a' ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// now check that we've opened the popup and all options are displayed
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( 'a' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)a/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 2 );
				// simulate typing 'p'
				simulateInput( wrapper, [ tx( 'ap' ) ] );
				// now check that the popup is still open and we've filtered the options to just the apple
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( 'ap' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)ap/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
				expect( wrapper.find( 'button.components-autocomplete__result' ) ).toHaveLength( 1 );
				// simulate typing ' '
				simulateInput( wrapper, [ tx( 'ap ' ) ] );
				// check the popup closes
				expectInitialState( wrapper );
				done();
			} );
		} );

		it( 'renders options provided via array', ( done ) => {
			const wrapper = makeAutocompleter( [
				{ ...slashCompleter, options },
			] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();

				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );

				const itemWrappers = wrapper.find( 'button.components-autocomplete__result' );
				expect( itemWrappers ).toHaveLength( 3 );

				const expectedLabelContent = options.map( ( o ) => o.label );
				const actualLabelContent = itemWrappers.map( ( itemWrapper ) => itemWrapper.text() );
				expect( actualLabelContent ).toEqual( expectedLabelContent );

				done();
			} );
		} );
		it( 'renders options provided via function that returns array', ( done ) => {
			const optionsMock = jest.fn( () => options );

			const wrapper = makeAutocompleter( [
				{ ...slashCompleter, options: optionsMock },
			] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();

				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );

				const itemWrappers = wrapper.find( 'button.components-autocomplete__result' );
				expect( itemWrappers ).toHaveLength( 3 );

				const expectedLabelContent = options.map( ( o ) => o.label );
				const actualLabelContent = itemWrappers.map( ( itemWrapper ) => itemWrapper.text() );
				expect( actualLabelContent ).toEqual( expectedLabelContent );

				done();
			} );
		} );
		it( 'renders options provided via function that returns promise', ( done ) => {
			const optionsMock = jest.fn( () => Promise.resolve( options ) );

			const wrapper = makeAutocompleter( [
				{ ...slashCompleter, options: optionsMock },
			] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();

				expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );

				const itemWrappers = wrapper.find( 'button.components-autocomplete__result' );
				expect( itemWrappers ).toHaveLength( 3 );

				const expectedLabelContent = options.map( ( o ) => o.label );
				const actualLabelContent = itemWrappers.map( ( itemWrapper ) => itemWrapper.text() );
				expect( actualLabelContent ).toEqual( expectedLabelContent );

				done();
			} );
		} );

		it( 'set the disabled attribute on results', ( done ) => {
			const wrapper = makeAutocompleter( [
				{
					...slashCompleter,
					options: [
						{
							id: 1,
							label: 'Bananas',
							keywords: [ 'fruit' ],
							isDisabled: true,
						},
						{
							id: 2,
							label: 'Apple',
							keywords: [ 'fruit' ],
							isDisabled: false,
						},
					],
				},
			] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();

				const firstItem = wrapper.find( 'button.components-autocomplete__result' ).at( 0 ).getDOMNode();
				expect( firstItem.hasAttribute( 'disabled' ) ).toBe( true );

				const secondItem = wrapper.find( 'button.components-autocomplete__result' ).at( 1 ).getDOMNode();
				expect( secondItem.hasAttribute( 'disabled' ) ).toBe( false );

				done();
			} );
		} );

		it( 'navigates options by arrow keys', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			// listen to keydown events on the editor to see if it gets them
			const editorKeydown = jest.fn();
			const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
			fakeEditor.addEventListener( 'keydown', editorKeydown, false );
			expectInitialState( wrapper );
			// the menu is not open so press an arrow and see if the editor gets it
			expect( editorKeydown ).not.toHaveBeenCalled();
			simulateKeydown( wrapper, DOWN );
			expect( editorKeydown ).toHaveBeenCalledTimes( 1 );
			// clear the call count
			editorKeydown.mockClear();
			// simulate typing '/', the menu is open so the editor should not get key down events
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				simulateKeydown( wrapper, DOWN );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 1 );
				simulateKeydown( wrapper, DOWN );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 2 );
				simulateKeydown( wrapper, DOWN );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				simulateKeydown( wrapper, UP );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 2 );
				simulateKeydown( wrapper, UP );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 1 );
				simulateKeydown( wrapper, UP );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				simulateKeydown( wrapper, UP );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 2 );
				expect( editorKeydown ).not.toHaveBeenCalled();
				done();
			} );
		} );

		it( 'resets selected index on subsequent search', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				simulateKeydown( wrapper, DOWN );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 1 );
				// simulate typing 'f
				simulateInput( wrapper, [ par( tx( '/f' ) ) ] );
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				done();
			} );
		} );

		it( 'closes by escape', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			// listen to keydown events on the editor to see if it gets them
			const editorKeydown = jest.fn();
			const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
			fakeEditor.addEventListener( 'keydown', editorKeydown, false );
			expectInitialState( wrapper );
			// the menu is not open so press escape and see if the editor gets it
			expect( editorKeydown ).not.toHaveBeenCalled();
			simulateKeydown( wrapper, ESCAPE );
			expect( editorKeydown ).toHaveBeenCalledTimes( 1 );
			// clear the call count
			editorKeydown.mockClear();
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with all options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'suppress' ) ).toBeUndefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( '' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				// pressing escape should suppress the dialog but it maintains the state
				simulateKeydown( wrapper, ESCAPE );
				expect( wrapper.state( 'suppress' ) ).toEqual( 0 );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				expect( wrapper.find( 'Popover' ) ).toHaveLength( 0 );
				// the editor should not have gotten the event
				expect( editorKeydown ).not.toHaveBeenCalled();
				done();
			} );
		} );

		it( 'closes by blur', () => {
			jest.spyOn( Autocomplete.prototype, 'handleFocusOutside' );

			const wrapper = makeAutocompleter( [], {
				AutocompleteComponent: EnhancedAutocomplete,
			} );
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			wrapper.find( '.fake-editor' ).simulate( 'blur' );

			jest.runAllTimers();

			expect( Autocomplete.prototype.handleFocusOutside ).toHaveBeenCalled();
		} );

		it( 'selects by enter', ( done ) => {
			const getOptionCompletion = jest.fn().mockReturnValue( {
				action: 'non-existent-action',
				value: 'dummy-value',
			} );
			const wrapper = makeAutocompleter( [ { ...slashCompleter, getOptionCompletion } ] );
			// listen to keydown events on the editor to see if it gets them
			const editorKeydown = jest.fn();
			const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
			fakeEditor.addEventListener( 'keydown', editorKeydown, false );
			expectInitialState( wrapper );
			// the menu is not open so press enter and see if the editor gets it
			expect( editorKeydown ).not.toHaveBeenCalled();
			simulateKeydown( wrapper, ENTER );
			expect( editorKeydown ).toHaveBeenCalledTimes( 1 );
			// clear the call count
			editorKeydown.mockClear();
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with all options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( '' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				// pressing enter should reset and call getOptionCompletion
				simulateKeydown( wrapper, ENTER );
				expectInitialState( wrapper );
				expect( getOptionCompletion ).toHaveBeenCalled();
				// the editor should not have gotten the event
				expect( editorKeydown ).not.toHaveBeenCalled();
				done();
			} );
		} );

		it( 'does not select when option is disabled', ( done ) => {
			const getOptionCompletion = jest.fn();
			const testOptions = [
				{
					id: 1,
					label: 'Bananas',
					keywords: [ 'fruit' ],
					isDisabled: true,
				},
				{
					id: 2,
					label: 'Apple',
					keywords: [ 'fruit' ],
					isDisabled: false,
				},
			];
			const wrapper = makeAutocompleter( [ { ...slashCompleter, getOptionCompletion, options: testOptions } ] );
			// listen to keydown events on the editor to see if it gets them
			const editorKeydown = jest.fn();
			const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
			fakeEditor.addEventListener( 'keydown', editorKeydown, false );
			expectInitialState( wrapper );
			// the menu is not open so press enter and see if the editor gets it
			expect( editorKeydown ).not.toHaveBeenCalled();
			simulateKeydown( wrapper, ENTER );
			expect( editorKeydown ).toHaveBeenCalledTimes( 1 );
			// clear the call count
			editorKeydown.mockClear();
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with all options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( '' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: testOptions[ 0 ], label: 'Bananas', keywords: [ 'fruit' ], isDisabled: true },
					{ key: '0-1', value: testOptions[ 1 ], label: 'Apple', keywords: [ 'fruit' ], isDisabled: false },
				] );
				// pressing enter should NOT reset and NOT call getOptionCompletion
				simulateKeydown( wrapper, ENTER );
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( getOptionCompletion ).not.toHaveBeenCalled();
				// the editor should not have gotten the event
				expect( editorKeydown ).not.toHaveBeenCalled();
				done();
			} );
		} );

		it( 'doesn\'t otherwise interfere with keydown behavior', ( done ) => {
			const wrapper = makeAutocompleter( [ slashCompleter ] );
			// listen to keydown events on the editor to see if it gets them
			const editorKeydown = jest.fn();
			const fakeEditor = wrapper.getDOMNode().querySelector( '.fake-editor' );
			fakeEditor.addEventListener( 'keydown', editorKeydown, false );
			expectInitialState( wrapper );
			[ UP, DOWN, ENTER, ESCAPE, SPACE ].forEach( ( keyCode, i ) => {
				simulateKeydown( wrapper, keyCode );
				expect( editorKeydown ).toHaveBeenCalledTimes( i + 1 );
			} );
			expect( editorKeydown ).toHaveBeenCalledTimes( 5 );
			done();
		} );

		it( 'selects by click', ( done ) => {
			const getOptionCompletion = jest.fn().mockReturnValue( {
				action: 'non-existent-action',
				value: 'dummy-value',
			} );
			const wrapper = makeAutocompleter( [ { ...slashCompleter, getOptionCompletion } ] );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );
			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with all options
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'selectedIndex' ) ).toBe( 0 );
				expect( wrapper.state( 'query' ) ).toEqual( '' );
				expect( wrapper.state( 'search' ) ).toEqual( /(?:\b|\s|^)/i );
				expect( wrapper.state( 'filteredOptions' ) ).toEqual( [
					{ key: '0-0', value: options[ 0 ], label: 'Bananas', keywords: [ 'fruit' ] },
					{ key: '0-1', value: options[ 1 ], label: 'Apple', keywords: [ 'fruit' ] },
					{ key: '0-2', value: options[ 2 ], label: 'Avocado', keywords: [ 'fruit' ] },
				] );
				// clicking should reset and select the item
				wrapper.find( '.components-autocomplete__result Button' ).at( 0 ).simulate( 'click' );
				wrapper.update();
				expectInitialState( wrapper );
				expect( getOptionCompletion ).toHaveBeenCalled();
				done();
			} );
		} );

		it( 'calls insertCompletion for a completion with action `insert-at-caret`', ( done ) => {
			const getOptionCompletion = jest.fn()
				.mockReturnValueOnce( {
					action: 'insert-at-caret',
					value: 'expected-value',
				} );

			const insertCompletion = jest.fn();

			const wrapper = makeAutocompleter(
				[ { ...slashCompleter, getOptionCompletion } ],
				{
					AutocompleteComponent: class extends Autocomplete {
						insertCompletion( ...args ) {
							return insertCompletion( ...args );
						}
					},
				}
			);
			expectInitialState( wrapper );

			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );

			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with at least one option
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'filteredOptions' ).length ).toBeGreaterThanOrEqual( 1 );

				// clicking should reset and select the item
				wrapper.find( '.components-autocomplete__result Button' ).at( 0 ).simulate( 'click' );
				wrapper.update();

				expect( insertCompletion ).toHaveBeenCalledTimes( 1 );
				expect( insertCompletion.mock.calls[ 0 ][ 1 ] ).toBe( 'expected-value' );
				done();
			} );
		} );

		it( 'calls insertCompletion for a completion without an action property', ( done ) => {
			const getOptionCompletion = jest.fn().mockReturnValueOnce( 'expected-value' );

			const insertCompletion = jest.fn();

			const wrapper = makeAutocompleter(
				[ { ...slashCompleter, getOptionCompletion } ],
				{
					AutocompleteComponent: class extends Autocomplete {
						insertCompletion( ...args ) {
							return insertCompletion( ...args );
						}
					},
				}
			);
			expectInitialState( wrapper );

			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );

			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with at least one option
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'filteredOptions' ).length ).toBeGreaterThanOrEqual( 1 );

				// clicking should reset and select the item
				wrapper.find( '.components-autocomplete__result Button' ).at( 0 ).simulate( 'click' );
				wrapper.update();

				expect( insertCompletion ).toHaveBeenCalledTimes( 1 );
				expect( insertCompletion.mock.calls[ 0 ][ 1 ] ).toBe( 'expected-value' );
				done();
			} );
		} );

		it( 'calls onReplace for a completion with action `replace`', ( done ) => {
			const getOptionCompletion = jest.fn()
				.mockReturnValueOnce( {
					action: 'replace',
					value: 'expected-value',
				} );

			const onReplace = jest.fn();

			const wrapper = makeAutocompleter(
				[ { ...slashCompleter, getOptionCompletion } ],
				{ onReplace } );
			expectInitialState( wrapper );
			// simulate typing '/'
			simulateInput( wrapper, [ par( tx( '/' ) ) ] );

			// wait for async popover display
			process.nextTick( () => {
				wrapper.update();
				// menu should be open with at least one option
				expect( wrapper.state( 'open' ) ).toBeDefined();
				expect( wrapper.state( 'filteredOptions' ).length ).toBeGreaterThanOrEqual( 1 );

				// clicking should reset and select the item
				wrapper.find( '.components-autocomplete__result Button' ).at( 0 ).simulate( 'click' );
				wrapper.update();

				expect( onReplace ).toHaveBeenCalledTimes( 1 );
				expect( onReplace ).toHaveBeenLastCalledWith( [ 'expected-value' ] );
				done();
			} );
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import SelectDropdown from '../index';

describe( 'index', () => {
	describe( 'component rendering', () => {
		test( 'should render a list with the provided options', () => {
			const dropdown = mountDropdown();
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__label' ).text()
			).to.eql( 'Statuses' );
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__option' )
			).to.have.lengthOf( 4 );
		} );

		test( 'should render a separator in place of any falsy option', () => {
			const dropdown = mountDropdown();
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__separator' )
			).to.have.lengthOf( 1 );
		} );

		test( 'should be initially closed', () => {
			const dropdown = shallowRenderDropdown();
			expect( dropdown.find( '.select-dropdown' ) ).to.have.lengthOf( 1 );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.be.empty;
		} );

		test( 'should execute toggleDropdown when clicked', () => {
			const dropdown = shallowRenderDropdown();

			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.have.lengthOf( 1 );
		} );

		test( 'should not respond when clicked when disabled', () => {
			const dropdown = shallowRenderDropdown( { disabled: true } );

			expect( dropdown.find( '.select-dropdown.is-disabled' ) ).to.have.lengthOf( 1 );

			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.be.empty;

			// Repeat to be sure
			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.be.empty;
		} );

		test( 'should be possible to open the dropdown via keyboard', () => {
			const dropdown = shallowRenderDropdown();

			// simulate pressing 'space' key
			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', createKeyEvent( 32 ) );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'getInitialSelectedItem', () => {
		test( 'should return the initially selected value (if any)', () => {
			const dropdown = shallowRenderDropdown( { initialSelected: 'drafts' } );
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).to.equal( 'drafts' );
		} );

		test( "should return `undefined`, when there aren't options", () => {
			const dropdown = shallow( <SelectDropdown /> );
			expect( dropdown.instance().getInitialSelectedItem() ).to.be.undefined;
		} );

		test( "should return the first not-label option, when there isn't a preselected value", () => {
			const dropdown = shallowRenderDropdown();
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).to.equal( 'published' );
		} );
	} );

	describe( 'getSelectedText', () => {
		test( 'should return the initially selected text (if any)', () => {
			const dropdown = shallowRenderDropdown( { selectedText: 'Drafts' } );
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).to.equal( 'Drafts' );
		} );

		test( 'should return the `label` associated to the selected option', () => {
			const dropdown = shallowRenderDropdown();
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).to.equal( 'Published' );
		} );

		test( 'should return the `label` associated to the initial selected option', () => {
			const dropdown = shallowRenderDropdown( { initialSelected: 'scheduled' } );
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).to.equal( 'Scheduled' );
		} );
	} );

	describe( 'selectItem', () => {
		test( 'should run the `onSelect` hook, and then update the state', () => {
			const dropdownOptions = getDropdownOptions();
			const onSelectSpy = sinon.spy();
			const dropdown = mount(
				<SelectDropdown options={ dropdownOptions } onSelect={ onSelectSpy } />
			);

			const newSelectedOption = dropdownOptions[ 2 ];
			dropdown.instance().selectItem( newSelectedOption );
			expect( dropdown.state( 'selected' ) ).to.equal( newSelectedOption.value );
		} );
	} );

	describe( 'toggleDropdown', () => {
		test( 'should toggle the `isOpen` state property', () => {
			function runToggleDropdownTest( isCurrentlyOpen ) {
				const dropdown = shallowRenderDropdown();
				dropdown.setState( { isOpen: isCurrentlyOpen } );

				dropdown.instance().toggleDropdown();
				expect( dropdown.state( 'isOpen' ) ).to.equal( ! isCurrentlyOpen );
			}

			runToggleDropdownTest( true );
			runToggleDropdownTest( false );
		} );
	} );

	describe( 'openDropdown', () => {
		test( 'should set the `isOpen` state property equal `true`', () => {
			const dropdown = shallowRenderDropdown();
			dropdown.instance().openDropdown();
			expect( dropdown.state( 'isOpen' ) ).to.equal( true );
		} );
	} );

	describe( 'closeDropdown', () => {
		test( "shouldn't do anything when the dropdown is already closed", () => {
			const dropdown = shallowRenderDropdown();
			dropdown.instance().closeDropdown();
			expect( dropdown.state( 'isOpen' ) ).to.equal( false );
		} );

		test( 'should set the `isOpen` state property equal `false`', () => {
			const dropdown = shallowRenderDropdown();
			dropdown.setState( { isOpen: true } );
			dropdown.instance().focused = 1;

			dropdown.instance().closeDropdown();
			expect( dropdown.state( 'isOpen' ) ).to.equal( false );
			expect( dropdown.instance().focused ).to.be.undefined;
		} );
	} );

	describe( 'navigateItem', () => {
		test( "permits to navigate through the dropdown's options by pressing the TAB key", () => {
			const tabKeyCode = 9;
			const tabEvent = createKeyEvent( tabKeyCode );

			const dropdown = mountDropdown();
			dropdown.setState( { isOpen: true } );

			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', tabEvent );
			expect( dropdown.instance().focused ).to.equal( 1 );
		} );

		test( 'permits to select an option by pressing ENTER, or SPACE', () => {
			function runNavigateItemTest( keyCode ) {
				const dropdown = shallowRenderDropdown();
				const activateItemSpy = sinon.spy( dropdown.instance(), 'activateItem' );
				const keyEvent = createKeyEvent( keyCode );

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.state( 'isOpen' ) ).to.equal( true );
				sinon.assert.calledOnce( keyEvent.preventDefault );
				sinon.assert.calledOnce( activateItemSpy );
			}

			const enterKeyCode = 13;
			const spaceKeyCode = 32;

			[ enterKeyCode, spaceKeyCode ].forEach( runNavigateItemTest );
		} );

		test( 'permits to close the dropdown by pressing ESCAPE', () => {
			const escapeKeyCode = 27;
			const escEvent = createKeyEvent( escapeKeyCode );

			const dropdown = mountDropdown();
			dropdown.setState( { isOpen: true } );

			const container = dropdown.find( '.select-dropdown__container' );
			container.simulate( 'keydown', escEvent );
			expect( dropdown.state( 'isOpen' ) ).to.equal( false );
			sinon.assert.calledOnce( escEvent.preventDefault );
			// check that container was focused
			expect( container.instance() ).to.equal( document.activeElement );
		} );

		describe( "permits to open the dropdown, and navigate through the dropdown's options by ", () => {
			function runNavigateItemTest( { keyCode, nextFocused } ) {
				const keyEvent = createKeyEvent( keyCode );
				const dropdown = mountDropdown();
				dropdown.instance().focused = 1;

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.state( 'isOpen' ) ).to.equal( true );

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.instance().focused ).to.equal( nextFocused );
			}

			const arrowUp = { keyCode: 38, nextFocused: 0 };
			const arrowDown = { keyCode: 40, nextFocused: 2 };

			[ arrowUp, arrowDown ].forEach( runNavigateItemTest );
		} );
	} );

	/**
	 * Utilities
	 */

	function mountDropdown() {
		const dropdownOptions = getDropdownOptions();
		return mount( <SelectDropdown options={ dropdownOptions } /> );
	}

	function shallowRenderDropdown( props ) {
		const dropdownOptions = getDropdownOptions();
		return shallow( <SelectDropdown options={ dropdownOptions } { ...props } /> );
	}

	function getDropdownOptions() {
		return [
			{ value: 'status-options', label: 'Statuses', isLabel: true },
			{ value: 'published', label: 'Published' },
			{ value: 'scheduled', label: 'Scheduled' },
			{ value: 'drafts', label: 'Drafts' },
			null,
			{ value: 'trashed', label: 'Trashed' },
		];
	}

	function createKeyEvent( keyCode ) {
		return {
			keyCode,
			preventDefault: sinon.spy(),
		};
	}
} );

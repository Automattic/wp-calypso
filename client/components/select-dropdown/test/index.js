/**
 * @format
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
			const toggleDropdownStub = sinon.stub( SelectDropdown.prototype, 'toggleDropdown' );

			const dropdown = shallowRenderDropdown();
			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );

			sinon.assert.calledOnce( toggleDropdownStub );
			toggleDropdownStub.restore();
		} );

		test( 'should be possible to control the dropdown via keyboard', () => {
			const navigateItemStub = sinon.stub( SelectDropdown.prototype, 'navigateItem' );

			const dropdown = shallowRenderDropdown();
			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown' );

			sinon.assert.calledOnce( navigateItemStub );
			navigateItemStub.restore();
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

		test( "should return the `label` associated to the initial selected option, when there isn't any selected option", () => {
			const getInitialSelectedItemStub = sinon.stub(
				SelectDropdown.prototype,
				'getInitialSelectedItem'
			);
			getInitialSelectedItemStub.returns( undefined );

			const dropdown = shallowRenderDropdown();

			getInitialSelectedItemStub.reset().returns( 'scheduled' );

			const initialSelectedText = dropdown.instance().getSelectedText();

			sinon.assert.calledOnce( getInitialSelectedItemStub );
			expect( initialSelectedText ).to.equal( 'Scheduled' );

			getInitialSelectedItemStub.restore();
		} );
	} );

	describe( 'selectItem', () => {
		test( 'should run the `onSelect` hook, and then update the state', () => {
			const setStateStub = sinon.stub( React.Component.prototype, 'setState' );

			const dropdownOptions = getDropdownOptions();
			const onSelectSpy = sinon.spy();
			const dropdown = mount(
				<SelectDropdown options={ dropdownOptions } onSelect={ onSelectSpy } />
			);

			setStateStub.reset();

			const newSelectedOption = dropdownOptions[ 2 ];
			dropdown.instance().selectItem( newSelectedOption );

			sinon.assert.calledOnce( onSelectSpy );
			sinon.assert.calledOnce( setStateStub );
			sinon.assert.calledWith( setStateStub, { selected: newSelectedOption.value } );

			setStateStub.restore();
		} );
	} );

	describe( 'toggleDropdown', () => {
		test( 'should toggle the `isOpen` state property', () => {
			function runToggleDropdownTest( isCurrentlyOpen ) {
				const setStateSpy = sinon.spy();
				const fakeContext = {
					setState: setStateSpy,
					state: {
						isOpen: isCurrentlyOpen,
					},
				};

				SelectDropdown.prototype.toggleDropdown.call( fakeContext );

				sinon.assert.calledOnce( setStateSpy );
				sinon.assert.calledWith( setStateSpy, { isOpen: ! isCurrentlyOpen } );
			}

			runToggleDropdownTest( true );
			runToggleDropdownTest( false );
		} );
	} );

	describe( 'openDropdown', () => {
		test( 'should set the `isOpen` state property equal `true`', () => {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy,
			};

			SelectDropdown.prototype.openDropdown.call( fakeContext );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { isOpen: true } );
		} );
	} );

	describe( 'closeDropdown', () => {
		test( "shouldn't do anything when the dropdown is already closed", () => {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy,
				state: {
					isOpen: false,
				},
			};

			SelectDropdown.prototype.closeDropdown.call( fakeContext );

			sinon.assert.notCalled( setStateSpy );
		} );

		test( 'should set the `isOpen` state property equal `false`', () => {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				focused: 1,
				setState: setStateSpy,
				state: {
					isOpen: true,
				},
			};

			SelectDropdown.prototype.closeDropdown.call( fakeContext );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { isOpen: false } );

			expect( fakeContext.focused ).to.be.undefined;
		} );
	} );

	describe( 'navigateItem', () => {
		test( "permits to navigate through the dropdown's options by pressing the TAB key", () => {
			const tabKeyCode = 9;
			const fakeEvent = prepareFakeEvent( tabKeyCode );
			const fakeContext = prepareFakeContext();

			SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

			sinon.assert.calledOnce( fakeContext.navigateItemByTabKey );
			sinon.assert.calledWith( fakeContext.navigateItemByTabKey, fakeEvent );
		} );

		test( 'permits to select an option by pressing ENTER, or SPACE', () => {
			function runNavigateItemTest( keyCode ) {
				const fakeEvent = prepareFakeEvent( keyCode );
				const fakeContext = prepareFakeContext();

				SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

				sinon.assert.calledOnce( fakeEvent.preventDefault );
				sinon.assert.calledOnce( fakeContext.activateItem );
			}

			const enterKeyCode = 13;
			const spaceKeyCode = 32;

			[ enterKeyCode, spaceKeyCode ].forEach( runNavigateItemTest );
		} );

		test( 'permits to close the dropdown by pressing ESCAPE', () => {
			const escapeKeyCode = 27;
			const fakeEvent = prepareFakeEvent( escapeKeyCode );
			const fakeContext = prepareFakeContext();

			SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

			sinon.assert.calledOnce( fakeEvent.preventDefault );

			const {
				refs: {
					dropdownContainer: { focus: focusSpy },
				},
				closeDropdown: closeDropdownSpy,
			} = fakeContext;
			sinon.assert.calledOnce( closeDropdownSpy );
			sinon.assert.calledOnce( focusSpy );
		} );

		test( "permits to open the dropdown, and navigate through the dropdown's options by pressing the arrow UP/DOWN keys", () => {
			function runNavigateItemTest( { keyCode, direction } ) {
				const fakeEvent = prepareFakeEvent( keyCode );
				const fakeContext = prepareFakeContext();

				SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

				sinon.assert.calledOnce( fakeEvent.preventDefault );

				sinon.assert.calledOnce( fakeContext.focusSibling );
				sinon.assert.calledWith( fakeContext.focusSibling, direction );

				sinon.assert.calledOnce( fakeContext.openDropdown );
			}

			const arrowUp = { keyCode: 38, direction: 'previous' };
			const arrowDown = { keyCode: 40, direction: 'next' };

			[ arrowUp, arrowDown ].forEach( runNavigateItemTest );
		} );

		function prepareFakeContext() {
			return {
				refs: {
					dropdownContainer: {
						focus: sinon.spy(),
					},
				},
				activateItem: sinon.spy(),
				closeDropdown: sinon.spy(),
				focusSibling: sinon.spy(),
				navigateItemByTabKey: sinon.spy(),
				openDropdown: sinon.spy(),
			};
		}

		function prepareFakeEvent( keyCode ) {
			return {
				keyCode,
				preventDefault: sinon.spy(),
			};
		}
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
} );

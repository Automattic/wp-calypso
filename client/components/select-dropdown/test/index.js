/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import SelectDropdown from '../index';

describe( 'index', function() {
	useFakeDom();

	describe( 'component rendering', function() {
		it( 'should render a list with the provided options', function() {
			const dropdown = mountDropdown();
			expect( dropdown.find( '.select-dropdown__options li.select-dropdown__label' ).text() ).to.eql( 'Statuses' );
			expect( dropdown.find( '.select-dropdown__options li.select-dropdown__option' ) ).to.have.lengthOf( 4 );
		} );

		it( 'should render a separator in place of any falsy option', function() {
			const dropdown = mountDropdown();
			expect( dropdown.find( '.select-dropdown__options li.select-dropdown__separator' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should be initially closed', function() {
			const dropdown = shallowRenderDropdown();
			expect( dropdown.find( '.select-dropdown' ) ).to.have.lengthOf( 1 );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).to.be.empty;
		} );

		it( 'should execute toggleDropdown when clicked', function() {
			const toggleDropdownStub = sinon.stub( SelectDropdown.prototype, 'toggleDropdown' );

			const dropdown = shallowRenderDropdown();
			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );

			sinon.assert.calledOnce( toggleDropdownStub );
			toggleDropdownStub.restore();
		} );

		it( 'should be possible to control the dropdown via keyboard', function() {
			const navigateItemStub = sinon.stub( SelectDropdown.prototype, 'navigateItem' );

			const dropdown = shallowRenderDropdown();
			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown' );

			sinon.assert.calledOnce( navigateItemStub );
			navigateItemStub.restore();
		} );
	} );

	describe( 'getInitialSelectedItem', function() {
		it( 'should return the initially selected value (if any)', function() {
			const dropdown = shallowRenderDropdown( { initialSelected: 'drafts' } );
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).to.equal( 'drafts' );
		} );

		it( "should return `undefined`, when there aren't options", function() {
			const dropdown = shallow( <SelectDropdown /> );
			expect( dropdown.instance().getInitialSelectedItem() ).to.be.undefined;
		} );

		it( "should return the first not-label option, when there isn't a preselected value", function() {
			const dropdown = shallowRenderDropdown();
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).to.equal( 'published' );
		} );
	} );

	describe( 'getSelectedText', function() {
		it( 'should return the initially selected text (if any)', function() {
			const dropdown = shallowRenderDropdown( { selectedText: 'Drafts' } );
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).to.equal( 'Drafts' );
		} );

		it( 'should return the `label` associated to the selected option', function() {
			const dropdown = shallowRenderDropdown();
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).to.equal( 'Published' );
		} );

		it( "should return the `label` associated to the initial selected option, when there isn't any selected option", function() {
			const getInitialSelectedItemStub = sinon.stub( SelectDropdown.prototype, 'getInitialSelectedItem' );
			getInitialSelectedItemStub.returns( undefined );

			const dropdown = shallowRenderDropdown();

			getInitialSelectedItemStub.reset().returns( 'scheduled' );

			const initialSelectedText = dropdown.instance().getSelectedText();

			sinon.assert.calledOnce( getInitialSelectedItemStub );
			expect( initialSelectedText ).to.equal( 'Scheduled' );

			getInitialSelectedItemStub.restore();
		} );
	} );

	describe( 'selectItem', function() {
		it( 'should run the `onSelect` hook, and then update the state', function() {
			const setStateStub = sinon.stub( React.Component.prototype, 'setState' );

			const dropdownOptions = getDropdownOptions();
			const onSelectSpy = sinon.spy();
			const dropdown = mount( <SelectDropdown options={ dropdownOptions } onSelect={ onSelectSpy } /> );

			setStateStub.reset();

			const newSelectedOption = dropdownOptions[ 2 ];
			dropdown.instance().selectItem( newSelectedOption );

			sinon.assert.calledOnce( onSelectSpy );
			sinon.assert.calledOnce( setStateStub );
			sinon.assert.calledWith( setStateStub, { selected: newSelectedOption.value } );

			setStateStub.restore();
		} );
	} );

	describe( 'toggleDropdown', function() {
		it( 'should toggle the `isOpen` state property', function() {
			function runToggleDropdownTest( isCurrentlyOpen ) {
				const setStateSpy = sinon.spy();
				const fakeContext = {
					setState: setStateSpy,
					state: {
						isOpen: isCurrentlyOpen
					}
				};

				SelectDropdown.prototype.toggleDropdown.call( fakeContext );

				sinon.assert.calledOnce( setStateSpy );
				sinon.assert.calledWith( setStateSpy, { isOpen: ! isCurrentlyOpen } );
			}

			runToggleDropdownTest( true );
			runToggleDropdownTest( false );
		} );
	} );

	describe( 'openDropdown', function() {
		it( 'should set the `isOpen` state property equal `true`', function() {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy
			};

			SelectDropdown.prototype.openDropdown.call( fakeContext );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { isOpen: true } );
		} );
	} );

	describe( 'closeDropdown', function() {
		it( "shouldn't do anything when the dropdown is already closed", function() {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy,
				state: {
					isOpen: false
				}
			};

			SelectDropdown.prototype.closeDropdown.call( fakeContext );

			sinon.assert.notCalled( setStateSpy );
		} );

		it( 'should set the `isOpen` state property equal `false`', function() {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				focused: 1,
				setState: setStateSpy,
				state: {
					isOpen: true
				}
			};

			SelectDropdown.prototype.closeDropdown.call( fakeContext );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { isOpen: false } );

			expect( fakeContext.focused ).to.be.undefined;
		} );
	} );

	describe( 'navigateItem', function() {
		it( "permits to navigate through the dropdown's options by pressing the TAB key", function() {
			const tabKeyCode = 9;
			const fakeEvent = prepareFakeEvent( tabKeyCode );
			const fakeContext = prepareFakeContext();

			SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

			sinon.assert.calledOnce( fakeContext.navigateItemByTabKey );
			sinon.assert.calledWith( fakeContext.navigateItemByTabKey, fakeEvent );
		} );

		it( 'permits to select an option by pressing ENTER, or SPACE', function() {
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

		it( 'permits to close the dropdown by pressing ESCAPE', function() {
			const escapeKeyCode = 27;
			const fakeEvent = prepareFakeEvent( escapeKeyCode );
			const fakeContext = prepareFakeContext();

			SelectDropdown.prototype.navigateItem.call( fakeContext, fakeEvent );

			sinon.assert.calledOnce( fakeEvent.preventDefault );

			const {
				refs: { dropdownContainer: { focus: focusSpy } },
				closeDropdown: closeDropdownSpy
			} = fakeContext;
			sinon.assert.calledOnce( closeDropdownSpy );
			sinon.assert.calledOnce( focusSpy );
		} );

		it( "permits to open the dropdown, and navigate through the dropdown's options by pressing the arrow UP/DOWN keys", function() {
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
						focus: sinon.spy()
					}
				},
				activateItem: sinon.spy(),
				closeDropdown: sinon.spy(),
				focusSibling: sinon.spy(),
				navigateItemByTabKey: sinon.spy(),
				openDropdown: sinon.spy()
			};
		}

		function prepareFakeEvent( keyCode ) {
			return {
				keyCode,
				preventDefault: sinon.spy()
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
			{ value: 'trashed', label: 'Trashed' }
		];
	}
} );

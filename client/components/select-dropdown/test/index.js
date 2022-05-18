/**
 * @jest-environment jsdom
 */
import { shallow, mount } from 'enzyme';
import SelectDropdown from '../index';

describe( 'index', () => {
	describe( 'component rendering', () => {
		test( 'should render a list with the provided options', () => {
			const dropdown = mountDropdown();
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__label' ).text()
			).toEqual( 'Statuses' );
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__option' )
			).toHaveLength( 4 );
		} );

		test( 'should render a separator in place of any falsy option', () => {
			const dropdown = mountDropdown();
			expect(
				dropdown.find( '.select-dropdown__options li.select-dropdown__separator' )
			).toHaveLength( 1 );
		} );

		test( 'should be initially closed', () => {
			const dropdown = shallowRenderDropdown();
			expect( dropdown.find( '.select-dropdown' ) ).toHaveLength( 1 );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).toHaveLength( 0 );
		} );

		test( 'should execute toggleDropdown when clicked', () => {
			const dropdown = shallowRenderDropdown();

			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).toHaveLength( 1 );
		} );

		test( 'should not respond when clicked when disabled', () => {
			const dropdown = shallowRenderDropdown( { disabled: true } );

			expect( dropdown.find( '.select-dropdown.is-disabled' ) ).toHaveLength( 1 );

			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).toHaveLength( 0 );

			// Repeat to be sure
			dropdown.find( '.select-dropdown__container' ).simulate( 'click' );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).toHaveLength( 0 );
		} );

		test( 'should be possible to open the dropdown via keyboard', () => {
			const dropdown = shallowRenderDropdown();

			// simulate pressing 'space' key
			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', createKeyEvent( 32 ) );
			expect( dropdown.find( '.select-dropdown.is-open' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'getInitialSelectedItem', () => {
		test( 'should return the initially selected value (if any)', () => {
			const dropdown = shallowRenderDropdown( { initialSelected: 'drafts' } );
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).toEqual( 'drafts' );
		} );

		test( "should return `undefined`, when there aren't options", () => {
			const dropdown = shallow( <SelectDropdown /> );
			expect( dropdown.instance().getInitialSelectedItem() ).toBeUndefined();
		} );

		test( "should return the first not-label option, when there isn't a preselected value", () => {
			const dropdown = shallowRenderDropdown();
			const initialSelectedValue = dropdown.instance().getInitialSelectedItem();
			expect( initialSelectedValue ).toEqual( 'published' );
		} );
	} );

	describe( 'getSelectedText', () => {
		test( 'should return the initially selected text (if any)', () => {
			const dropdown = shallowRenderDropdown( { selectedText: 'Drafts' } );
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).toEqual( 'Drafts' );
		} );

		test( 'should return the `label` associated to the selected option', () => {
			const dropdown = shallowRenderDropdown();
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).toEqual( 'Published' );
		} );

		test( 'should return the `label` associated to the initial selected option', () => {
			const dropdown = shallowRenderDropdown( { initialSelected: 'scheduled' } );
			const initialSelectedText = dropdown.instance().getSelectedText();
			expect( initialSelectedText ).toEqual( 'Scheduled' );
		} );
	} );

	describe( 'selectItem', () => {
		test( 'should run the `onSelect` hook, and then update the state', () => {
			const dropdownOptions = getDropdownOptions();
			const onSelectSpy = jest.fn();
			const dropdown = mount(
				<SelectDropdown options={ dropdownOptions } onSelect={ onSelectSpy } />
			);

			const newSelectedOption = dropdownOptions[ 2 ];
			dropdown.instance().selectItem( newSelectedOption );
			expect( dropdown.state( 'selected' ) ).toEqual( newSelectedOption.value );
		} );
	} );

	describe( 'toggleDropdown', () => {
		test( 'should toggle the `isOpen` state property', () => {
			function runToggleDropdownTest( isCurrentlyOpen ) {
				const dropdown = shallowRenderDropdown();
				dropdown.setState( { isOpen: isCurrentlyOpen } );

				dropdown.instance().toggleDropdown();
				expect( dropdown.state( 'isOpen' ) ).toEqual( ! isCurrentlyOpen );
			}

			runToggleDropdownTest( true );
			runToggleDropdownTest( false );
		} );
	} );

	describe( 'openDropdown', () => {
		test( 'should set the `isOpen` state property equal `true`', () => {
			const dropdown = shallowRenderDropdown();
			dropdown.instance().openDropdown();
			expect( dropdown.state( 'isOpen' ) ).toEqual( true );
		} );
	} );

	describe( 'closeDropdown', () => {
		test( "shouldn't do anything when the dropdown is already closed", () => {
			const dropdown = shallowRenderDropdown();
			dropdown.instance().closeDropdown();
			expect( dropdown.state( 'isOpen' ) ).toEqual( false );
		} );

		test( 'should set the `isOpen` state property equal `false`', () => {
			const dropdown = shallowRenderDropdown();
			dropdown.setState( { isOpen: true } );
			dropdown.instance().focused = 1;

			dropdown.instance().closeDropdown();
			expect( dropdown.state( 'isOpen' ) ).toEqual( false );
			expect( dropdown.instance().focused ).toBeUndefined();
		} );
	} );

	describe( 'navigateItem', () => {
		test( "permits to navigate through the dropdown's options by pressing the TAB key", () => {
			const tabKeyCode = 9;
			const tabEvent = createKeyEvent( tabKeyCode );

			const dropdown = mountDropdown();
			dropdown.setState( { isOpen: true } );

			dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', tabEvent );
			expect( dropdown.instance().focused ).toEqual( 1 );
		} );

		test( 'permits to select an option by pressing ENTER, or SPACE', () => {
			function runNavigateItemTest( keyCode ) {
				const dropdown = shallowRenderDropdown();
				const activateItemSpy = jest.spyOn( dropdown.instance(), 'activateItem' );
				const keyEvent = createKeyEvent( keyCode );

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.state( 'isOpen' ) ).toEqual( true );
				expect( activateItemSpy ).toBeCalledTimes( 1 );
			}

			const enterKeyCode = 13;
			const spaceKeyCode = 32;

			[ enterKeyCode, spaceKeyCode ].forEach( runNavigateItemTest );
		} );

		test( 'permits to close the dropdown by pressing ESCAPE', () => {
			const escapeKeyCode = 27;
			const escEvent = createKeyEvent( escapeKeyCode );

			const dropdown = mountDropdown( true );
			dropdown.setState( { isOpen: true } );

			const container = dropdown.find( '.select-dropdown__container' );
			container.simulate( 'keydown', escEvent );
			expect( dropdown.state( 'isOpen' ) ).toEqual( false );
			// check that container was focused
			expect( container.instance() ).toEqual( document.activeElement );
			dropdown.unmount();
		} );

		describe( "permits to open the dropdown, and navigate through the dropdown's options by", () => {
			function runNavigateItemTest( { keyCode, nextFocused } ) {
				const keyEvent = createKeyEvent( keyCode );
				const dropdown = mountDropdown();
				dropdown.instance().focused = 1;

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.state( 'isOpen' ) ).toEqual( true );

				dropdown.find( '.select-dropdown__container' ).simulate( 'keydown', keyEvent );
				expect( dropdown.instance().focused ).toEqual( nextFocused );
			}

			const arrowUp = { keyCode: 38, nextFocused: 0 };
			const arrowDown = { keyCode: 40, nextFocused: 2 };

			[ arrowUp, arrowDown ].forEach( runNavigateItemTest );
		} );
	} );

	/**
	 * Utilities
	 */

	function mountDropdown( attach = false ) {
		const dropdownOptions = getDropdownOptions();
		return mount(
			<SelectDropdown options={ dropdownOptions } />,
			attach ? { attachTo: document.body } : undefined
		);
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
			preventDefault: jest.fn(),
		};
	}
} );

/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectDropdown from '../index';

const DROPDOWN_OPTIONS = [
	{ value: 'status-options', label: 'Statuses', isLabel: true },
	{ value: 'published', label: 'Published' },
	{ value: 'scheduled', label: 'Scheduled' },
	{ value: 'drafts', label: 'Drafts' },
	null,
	{ value: 'trashed', label: 'Trashed' },
];

function renderDropdown( props ) {
	return render( <SelectDropdown options={ DROPDOWN_OPTIONS } { ...props } /> );
}

describe( 'component rendering', () => {
	test( 'should render a list with the provided options', () => {
		renderDropdown();
		expect( screen.getByRole( 'presentation' ) ).toHaveTextContent( 'Statuses' );
		expect( screen.queryAllByRole( 'listitem' ) ).toHaveLength( 4 );
	} );

	test( 'should render a separator in place of any falsy option', () => {
		renderDropdown();
		expect( screen.queryAllByRole( 'separator' ) ).toHaveLength( 1 );
	} );

	test( 'should be initially closed', () => {
		renderDropdown();
		expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	test( 'should execute toggleDropdown when clicked', async () => {
		renderDropdown();

		const btn = screen.getByRole( 'button' );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'false' );

		await userEvent.click( btn );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'true' );

		await userEvent.click( btn );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	test( 'should not respond when clicked when disabled', async () => {
		renderDropdown( { disabled: true } );

		const btn = screen.getByRole( 'button' );
		expect( btn ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( btn );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	test( 'should be possible to open the dropdown via keyboard', async () => {
		renderDropdown();

		const btn = screen.getByRole( 'button' );

		await userEvent.tab();
		expect( btn ).toHaveFocus();

		await userEvent.keyboard( '[Space]' );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	test( 'should render a header with custom label', () => {
		renderDropdown( { ariaLabel: 'Custom Field Label' } );

		const btn = screen.getByRole( 'button' );
		expect( btn.firstChild.firstChild ).toHaveAttribute( 'aria-label', 'Custom Field Label' );
	} );
} );

describe( 'selected items', () => {
	test( 'should return the initially selected value (if any)', () => {
		renderDropdown( { initialSelected: 'drafts' } );

		const selected = screen.queryByRole( 'menuitem', { current: true } );
		expect( selected ).toHaveTextContent( 'Drafts' );

		const btn = screen.getByRole( 'button' );
		expect( btn.firstChild ).toHaveTextContent( 'Drafts' );
	} );

	test( "should return `undefined`, when there aren't options", () => {
		render( <SelectDropdown /> );

		const selected = screen.queryByRole( 'menuitem', { current: true } );
		expect( selected ).toBeNull();

		const btn = screen.getByRole( 'button' );
		expect( btn.firstChild ).toHaveTextContent( '' );
	} );

	test( "should return the first not-label option, when there isn't a preselected value", () => {
		renderDropdown();

		const selected = screen.queryByRole( 'menuitem', { current: true } );
		expect( selected ).toHaveTextContent( 'Published' );

		const btn = screen.getByRole( 'button' );
		expect( btn.firstChild ).toHaveTextContent( 'Published' );
	} );

	test( 'should return the initially selected text (if any)', () => {
		renderDropdown( { selectedText: 'Drafts' } );

		const btn = screen.getByRole( 'button' );
		expect( btn.firstChild ).toHaveTextContent( 'Drafts' );
	} );
} );

describe( 'selectItem', () => {
	test( 'should run the `onSelect` hook, and then update the state', async () => {
		const onSelectSpy = jest.fn();

		renderDropdown( { onSelect: onSelectSpy } );

		const item = screen.getByRole( 'menuitem', { name: DROPDOWN_OPTIONS[ 2 ].label } );

		await userEvent.click( item );

		const selected = screen.getByRole( 'menuitem', { current: true } );
		expect( selected ).toHaveTextContent( DROPDOWN_OPTIONS[ 2 ].label );

		expect( onSelectSpy ).toHaveBeenCalledTimes( 1 );
		expect( onSelectSpy ).toHaveBeenCalledWith( DROPDOWN_OPTIONS[ 2 ] );
	} );
} );

describe( 'navigateItem', () => {
	test( "permits to navigate through the dropdown's options by pressing the TAB key", async () => {
		renderDropdown();

		const btn = screen.getByRole( 'button' );

		await userEvent.click( btn );
		await userEvent.tab();
		await userEvent.keyboard( '[Space]' );

		expect( screen.getByRole( 'menuitem', { current: true } ) ).toHaveTextContent( 'Scheduled' );
	} );

	test( 'permits to select an option by pressing ENTER', async () => {
		const onSelectSpy = jest.fn();
		renderDropdown( { onSelect: onSelectSpy } );

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );
		await userEvent.tab();
		await userEvent.keyboard( '[Enter]' );

		expect( onSelectSpy ).toHaveBeenCalledTimes( 1 );
		expect( onSelectSpy ).toHaveBeenCalledWith( DROPDOWN_OPTIONS[ 2 ] );
	} );

	test( 'permits to select an option by pressing SPACE', async () => {
		const onSelectSpy = jest.fn();
		renderDropdown( { onSelect: onSelectSpy } );

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );
		await userEvent.tab();
		await userEvent.keyboard( '[Space]' );

		expect( onSelectSpy ).toHaveBeenCalledTimes( 1 );
		expect( onSelectSpy ).toHaveBeenCalledWith( DROPDOWN_OPTIONS[ 2 ] );
	} );

	test( 'permits to close the dropdown by pressing ESCAPE', async () => {
		renderDropdown();

		const btn = screen.getByRole( 'button' );
		await userEvent.click( btn );

		expect( btn ).toHaveAttribute( 'aria-expanded', 'true' );

		await userEvent.keyboard( '[Escape]' );

		expect( btn ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( btn ).toHaveFocus();
	} );

	test( "permits to open the dropdown, and navigate through the dropdown's options with arrow keys", async () => {
		renderDropdown();

		const btn = screen.getByRole( 'button' );
		const items = screen.getAllByRole( 'menuitem' );

		await userEvent.tab();
		await userEvent.keyboard( '[ArrowDown]' );

		expect( btn ).toHaveAttribute( 'aria-expanded', 'true' );

		await userEvent.keyboard( '[Escape]' );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'false' );

		await userEvent.keyboard( '[ArrowUp]' );
		expect( btn ).toHaveAttribute( 'aria-expanded', 'true' );

		await userEvent.keyboard( '[ArrowDown]' );
		expect( items[ 1 ] ).toHaveFocus();

		await userEvent.keyboard( '[ArrowDown]' );
		expect( items[ 2 ] ).toHaveFocus();

		await userEvent.keyboard( '[ArrowUp]' );
		expect( items[ 1 ] ).toHaveFocus();
	} );
} );

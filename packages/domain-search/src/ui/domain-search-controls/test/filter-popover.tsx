import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSearchControlsFilterPopover } from '../filter-popover';

describe( 'DomainSearchControlsFilterPopover', () => {
	const defaultProps = {
		filter: {
			tlds: [],
			exactSldMatchesOnly: false,
		},
		availableTlds: [ 'com', 'net', 'org' ],
		onApply: jest.fn(),
		onClear: jest.fn(),
	};

	it( 'renders the filter popover with default state', () => {
		render( <DomainSearchControlsFilterPopover { ...defaultProps } /> );

		expect( screen.getByPlaceholderText( 'Search for an ending' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Show exact matches only' ) ).not.toBeChecked();
		expect( screen.getByText( 'Clear' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Apply' ) ).toBeInTheDocument();
	} );

	it( 'displays available TLDs', () => {
		render( <DomainSearchControlsFilterPopover { ...defaultProps } /> );

		expect( screen.getByText( '.com' ) ).toBeInTheDocument();
		expect( screen.getByText( '.net' ) ).toBeInTheDocument();
		expect( screen.getByText( '.org' ) ).toBeInTheDocument();
	} );

	it( 'remove TLDs from the list when they are selected', async () => {
		const fireEvent = userEvent.setup();

		render( <DomainSearchControlsFilterPopover { ...defaultProps } /> );

		await fireEvent.click( screen.getByText( '.com' ) );

		expect( screen.queryByText( '.com' ) ).not.toBeInTheDocument();
	} );

	it( 'splits TLDs into recommended and explore more sections', () => {
		render(
			<DomainSearchControlsFilterPopover
				{ ...defaultProps }
				availableTlds={ [ 'com', 'net', 'org', 'co.uk', 'de', 'fr', 'es', 'it', 'nl', 'be' ] }
			/>
		);

		const allItems = screen.getByRole( 'listbox' );

		expect( allItems.children[ 0 ].textContent ).toBe( 'Recommended endings' );
		expect( allItems.children[ 1 ].textContent ).toBe( '.com' );
		expect( allItems.children[ 2 ].textContent ).toBe( '.net' );
		expect( allItems.children[ 3 ].textContent ).toBe( '.org' );
		expect( allItems.children[ 4 ].textContent ).toBe( '.co.uk' );
		expect( allItems.children[ 5 ].textContent ).toBe( '.de' );
		expect( allItems.children[ 6 ].textContent ).toBe( 'Explore more endings' );
		expect( allItems.children[ 7 ].textContent ).toBe( '.be' );
		expect( allItems.children[ 8 ].textContent ).toBe( '.es' );
		expect( allItems.children[ 9 ].textContent ).toBe( '.fr' );
		expect( allItems.children[ 10 ].textContent ).toBe( '.it' );
		expect( allItems.children[ 11 ].textContent ).toBe( '.nl' );
	} );

	it( 'remove category headings from the list when they are selected', async () => {
		const fireEvent = userEvent.setup();

		render(
			<DomainSearchControlsFilterPopover
				{ ...defaultProps }
				availableTlds={ [ 'com', 'net', 'org', 'co.uk', 'de', 'fr' ] }
			/>
		);

		expect( screen.getByText( 'Recommended endings' ) ).toBeInTheDocument();

		await fireEvent.click( screen.getByText( '.com' ) );
		await fireEvent.click( screen.getByText( '.net' ) );
		await fireEvent.click( screen.getByText( '.org' ) );
		await fireEvent.click( screen.getByText( '.co.uk' ) );
		await fireEvent.click( screen.getByText( '.de' ) );

		expect( screen.queryByText( 'Recommended endings' ) ).not.toBeInTheDocument();

		expect( screen.queryByText( 'Explore more endings' ) ).toBeInTheDocument();

		await fireEvent.click( screen.getByText( '.fr' ) );

		expect( screen.queryByText( 'Explore more endings' ) ).not.toBeInTheDocument();
	} );

	it( 'calls onApply with updated filter when Apply is clicked', async () => {
		const fireEvent = userEvent.setup();

		const onApply = jest.fn();

		render( <DomainSearchControlsFilterPopover { ...defaultProps } onApply={ onApply } /> );

		// Toggle exact matches
		await fireEvent.click( screen.getByLabelText( 'Show exact matches only' ) );

		// Click apply
		await fireEvent.click( screen.getByText( 'Apply' ) );

		expect( onApply ).toHaveBeenCalledWith( {
			tlds: [],
			exactSldMatchesOnly: true,
		} );
	} );

	it( 'calls onClear when Clear button is clicked', async () => {
		const fireEvent = userEvent.setup();

		const onClear = jest.fn();

		render( <DomainSearchControlsFilterPopover { ...defaultProps } onClear={ onClear } /> );

		await fireEvent.click( screen.getByText( 'Clear' ) );

		expect( onClear ).toHaveBeenCalled();
	} );

	it( 'updates filter when TLD is selected', async () => {
		const fireEvent = userEvent.setup();

		const onApply = jest.fn();

		render( <DomainSearchControlsFilterPopover { ...defaultProps } onApply={ onApply } /> );

		// Click a TLD
		await fireEvent.click( screen.getByText( '.com' ) );

		// Click apply
		await fireEvent.click( screen.getByText( 'Apply' ) );

		expect( onApply ).toHaveBeenCalledWith( {
			tlds: [ 'com' ],
			exactSldMatchesOnly: false,
		} );
	} );
} );

import { render, screen } from '@testing-library/react';
import { DomainSearchControlsFilterButton } from '../filter-button';

describe( 'DomainSearchControlsFilterButton', () => {
	it( 'says no filter applied if there are no selected TLDs', () => {
		render( <DomainSearchControlsFilterButton count={ 0 } onClick={ jest.fn() } /> );
		expect( screen.getByLabelText( 'Filter, no filters applied' ) ).toBeInTheDocument();
	} );

	it( 'says one filter applied if there is one selected TLD', () => {
		render( <DomainSearchControlsFilterButton count={ 1 } onClick={ jest.fn() } /> );
		expect( screen.getByLabelText( 'Filter, 1 filter applied' ) ).toBeInTheDocument();
	} );

	it( 'says multiple filters applied if there are multiple selected TLDs', () => {
		render( <DomainSearchControlsFilterButton count={ 2 } onClick={ jest.fn() } /> );
		expect( screen.getByLabelText( 'Filter, 2 filters applied' ) ).toBeInTheDocument();
	} );
} );

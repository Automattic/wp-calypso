import { render, screen } from '@testing-library/react';
import ThemeCard from '../index';

describe( '<ThemeCard />', () => {
	it( 'should render only the Active badge when active and not retired', () => {
		render( <ThemeCard name="Stewart" image={ <img alt="" /> } isActive /> );

		expect( screen.getByText( 'Active' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Retired' ) ).not.toBeInTheDocument();
	} );

	it( 'should render both the Active and Retired badges when active and retired', () => {
		render( <ThemeCard name="Stewart" image={ <img alt="" /> } isActive isThemeRetired /> );

		expect( screen.getByText( 'Active' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Retired' ) ).toBeInTheDocument();
	} );

	it( 'should not render the Retired badge when retired but not active', () => {
		render( <ThemeCard name="Stewart" image={ <img alt="" /> } isThemeRetired /> );

		expect( screen.queryByText( 'Retired' ) ).not.toBeInTheDocument();
	} );
} );

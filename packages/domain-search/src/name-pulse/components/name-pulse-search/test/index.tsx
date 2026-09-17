/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { NamePulseSearch } from '..';

describe( 'NamePulseSearch', () => {
	it( 'renders the placeholder as a list item', () => {
		render( <NamePulseSearch /> );

		expect( screen.getByRole( 'listitem' ) ).toHaveTextContent( 'Name Pulse search' );
	} );
} );

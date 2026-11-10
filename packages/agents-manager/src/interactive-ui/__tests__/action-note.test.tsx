import { render, screen } from '@testing-library/react';
import { InteractiveUiActionNote } from '../action-note';

describe( 'InteractiveUiActionNote', () => {
	it( 'shows the `userMessage` as plain text after its prefix', () => {
		render( <InteractiveUiActionNote userMessage="**Save** the title" /> );

		expect( screen.getByText( 'You chose: **Save** the title' ) ).toBeVisible();
	} );
} );

/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Text } from '..';

describe( 'Text', () => {
	test( 'adds a stable class for muted text', () => {
		render(
			<Text role="note" variant="muted">
				Muted copy
			</Text>
		);

		expect( screen.getByRole( 'note' ) ).toHaveClass( 'dashboard-text--muted' );
	} );
} );

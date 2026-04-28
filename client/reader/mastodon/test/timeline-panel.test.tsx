/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { TimelinePanel } from '../timeline-panel';

describe( 'TimelinePanel', () => {
	it( 'renders the coming-soon placeholder text', () => {
		render( <TimelinePanel /> );
		expect( screen.getByRole( 'heading', { name: /timeline/i } ) ).toBeVisible();
		expect( screen.getByText( /still building this part/i ) ).toBeVisible();
	} );
} );

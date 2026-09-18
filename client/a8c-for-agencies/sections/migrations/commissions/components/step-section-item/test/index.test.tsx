/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StepSectionItem from '../index';

describe( 'StepSectionItem', () => {
	it( 'renders the heading and a string description', () => {
		render( <StepSectionItem heading="Concierge Migrations" description="We move your sites." /> );

		expect( screen.getByText( 'Concierge Migrations' ) ).toBeVisible();
		expect( screen.getByText( 'We move your sites.' ) ).toBeVisible();
	} );

	it( 'renders a node description and children', () => {
		render(
			<StepSectionItem heading="Tag sites" description={ <a href="/x">Learn more</a> }>
				<button>Tag now</button>
			</StepSectionItem>
		);

		expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Tag now' } ) ).toBeVisible();
	} );
} );

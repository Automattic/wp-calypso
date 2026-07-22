/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StepSection from '../index';

describe( 'StepSection', () => {
	it( 'renders the heading and children', () => {
		render(
			<StepSection heading="Get started">
				<span>Body content</span>
			</StepSection>
		);

		expect( screen.getByText( 'Get started' ) ).toBeVisible();
		expect( screen.getByText( 'Body content' ) ).toBeVisible();
	} );

	it( 'renders the step count when provided', () => {
		render(
			<StepSection heading="Get started" stepCount={ 3 }>
				<span>Body</span>
			</StepSection>
		);

		expect( screen.getByText( '3' ) ).toBeVisible();
	} );

	it( 'omits the step count when not provided', () => {
		const { container } = render(
			<StepSection heading="Get started">
				<span>Body</span>
			</StepSection>
		);

		expect(
			container.querySelector( '.commissions-step-section-step-count' )
		).not.toBeInTheDocument();
	} );
} );

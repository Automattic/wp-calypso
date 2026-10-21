/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { YearsOfServiceBadge } from '../index';

describe( 'YearsOfServiceBadge', () => {
	test( 'should render the years number', () => {
		render( <YearsOfServiceBadge size="large" yearsOfService={ 5 } /> );

		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'defaults the large-size label to the plural form when years > 1', () => {
		render( <YearsOfServiceBadge size="large" yearsOfService={ 5 } /> );

		expect( screen.getByText( 'Years on WordPress.com' ) ).toBeVisible();
	} );

	test( 'defaults the large-size label to the singular form when years === 1', () => {
		render( <YearsOfServiceBadge size="large" yearsOfService={ 1 } /> );

		expect( screen.getByText( 'Year on WordPress.com' ) ).toBeVisible();
	} );

	test( 'renders a custom label when one is provided', () => {
		render( <YearsOfServiceBadge size="large" yearsOfService={ 5 } label="Years of Service" /> );

		expect( screen.getByText( 'Years of Service' ) ).toBeVisible();
		expect( screen.queryByText( 'Years on WordPress.com' ) ).not.toBeInTheDocument();
	} );

	test( 'suppresses the label when an empty string is passed', () => {
		const { container } = render(
			<YearsOfServiceBadge size="large" yearsOfService={ 5 } label="" />
		);

		expect( container.querySelector( '.years-of-service-badge__label' ) ).toBeNull();
	} );

	test( 'should not render label text for medium size', () => {
		render( <YearsOfServiceBadge size="medium" yearsOfService={ 5 } /> );

		expect( screen.queryByText( /Years? on WordPress\.com/i ) ).not.toBeInTheDocument();
	} );

	test( 'should not render label text for small size', () => {
		render( <YearsOfServiceBadge size="small" yearsOfService={ 3 } /> );

		expect( screen.queryByText( /Years? on WordPress\.com/i ) ).not.toBeInTheDocument();
	} );

	test( 'should have plural title and aria-label for medium size when years > 1', () => {
		render( <YearsOfServiceBadge size="medium" yearsOfService={ 5 } /> );

		expect( screen.getByTitle( '5 years on WordPress.com' ) ).toBeVisible();
		expect( screen.getByLabelText( '5 years on WordPress.com' ) ).toBeVisible();
	} );

	test( 'should have singular title and aria-label for small size when years === 1', () => {
		render( <YearsOfServiceBadge size="small" yearsOfService={ 1 } /> );

		expect( screen.getByTitle( '1 year on WordPress.com' ) ).toBeVisible();
		expect( screen.getByLabelText( '1 year on WordPress.com' ) ).toBeVisible();
	} );

	test( 'should apply size-specific CSS class', () => {
		const { container } = render( <YearsOfServiceBadge size="large" yearsOfService={ 10 } /> );

		expect( container.querySelector( '.years-of-service-badge.is-large' ) ).toBeInTheDocument();
	} );

	test( 'applies .is-achievement-card for the achievement-card size', () => {
		const { container } = render(
			<YearsOfServiceBadge size="achievement-card" yearsOfService={ 5 } />
		);

		expect(
			container.querySelector( '.years-of-service-badge.is-achievement-card' )
		).toBeInTheDocument();
	} );

	test( 'omits the visible label and the circle aria-label for the achievement-card size', () => {
		const { container } = render(
			<YearsOfServiceBadge size="achievement-card" yearsOfService={ 5 } />
		);

		expect( container.querySelector( '.years-of-service-badge__label' ) ).toBeNull();
		expect( screen.queryByLabelText( /years on WordPress\.com/i ) ).not.toBeInTheDocument();
	} );
} );

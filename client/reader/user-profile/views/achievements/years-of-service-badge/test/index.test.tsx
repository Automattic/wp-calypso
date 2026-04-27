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

	test( 'should render label text for large size', () => {
		render( <YearsOfServiceBadge size="large" yearsOfService={ 5 } /> );

		expect( screen.getByText( /Years on WordPress\.com/i ) ).toBeVisible();
	} );

	test( 'should not render label text for medium size', () => {
		render( <YearsOfServiceBadge size="medium" yearsOfService={ 5 } /> );

		expect( screen.queryByText( /Years on WordPress\.com/i ) ).not.toBeInTheDocument();
	} );

	test( 'should not render label text for small size', () => {
		render( <YearsOfServiceBadge size="small" yearsOfService={ 3 } /> );

		expect( screen.queryByText( /Years on WordPress\.com/i ) ).not.toBeInTheDocument();
	} );

	test( 'should have title attribute for medium size', () => {
		render( <YearsOfServiceBadge size="medium" yearsOfService={ 5 } /> );

		expect( screen.getByTitle( /5 years on WordPress\.com/i ) ).toBeVisible();
	} );

	test( 'should have title attribute for small size', () => {
		render( <YearsOfServiceBadge size="small" yearsOfService={ 3 } /> );

		expect( screen.getByTitle( /3 years on WordPress\.com/i ) ).toBeVisible();
	} );

	test( 'should apply size-specific CSS class', () => {
		const { container } = render( <YearsOfServiceBadge size="large" yearsOfService={ 10 } /> );

		expect( container.querySelector( '.years-of-service-badge.is-large' ) ).toBeInTheDocument();
	} );
} );

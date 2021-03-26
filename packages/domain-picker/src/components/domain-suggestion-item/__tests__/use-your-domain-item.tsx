/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import UseYourDomainItem from '../use-your-domain-item';

describe( '<UseYourDomainItem />', () => {
	it( 'should render with correct messaging', () => {
		render( <UseYourDomainItem onClick={ jest.fn() } /> );

		expect( screen.getByText( 'Already own a domain?' ) ).toBeInTheDocument();
		expect( screen.getByText( "You can use it as your site's address." ) ).toBeInTheDocument();
	} );

	it( 'should fire onClick callback when the button is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Use a domain I own' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should fire onClick callback when the rest of the row is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByText( 'Already own a domain?' ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );

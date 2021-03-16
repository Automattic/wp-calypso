/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import UseYourDomainItem from '../src/domain-picker/use-your-domain-item';

describe( '<UseYourDomainItem />', () => {
	it( 'should render with correct messaging', () => {
		render( <UseYourDomainItem onClick={ jest.fn() } /> );

		expect( screen.getByText( 'Already own a domain?' ) ).toBeInTheDocument();
		expect( screen.getByText( "You can use it as your site's address." ) ).toBeInTheDocument();
	} );

	it( 'should fire onClick callback when the button is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByText( 'Use a domain I own' ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should fire onClick callback when the container is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByTestId( 'use-domain-i-own-wrapper' ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );

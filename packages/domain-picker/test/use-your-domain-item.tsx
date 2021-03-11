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

	it( 'should fire onClick callback when clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByText( 'Use a domain I own' ) );

		// TODO: why is it called twice?
		expect( onClick ).toHaveBeenCalledTimes( 2 );
	} );
} );

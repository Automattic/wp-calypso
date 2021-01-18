/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import UseYourDomainItem from '../src/domain-picker/use-your-domain-item';

describe( '<UseYourDomainItem />', () => {
	test( 'Component renders with correct messaging', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		expect( screen.getByText( 'Already own a domain?' ) ).toBeTruthy();
		expect( screen.getByText( "You can use it as your site's address" ) ).toBeTruthy();
	} );

	test( 'Component fires onClick callback onClick', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByText( 'Use a domain I own' ) );
		expect( onClick ).toHaveBeenCalled();
	} );
} );

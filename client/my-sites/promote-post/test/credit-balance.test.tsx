/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BlazeCreditStatus, useBlazeCredits } from 'calypso/lib/promote-post';
import CreditBalance from '../components/credit-balance';

// Mock the useBlazeCredits hook, so we can tell TS about MockReturnValue
type UseBlazeCreditsMock = jest.Mock< BlazeCreditStatus >;

jest.mock( 'calypso/lib/promote-post', () => {
	const module = jest.requireActual( 'calypso/lib/promote-post' );
	return {
		...module,
		useBlazeCredits: jest.fn< UseBlazeCreditsMock, [] >(),
	};
} );

describe( 'CreditBalance component', () => {
	test( 'displays null when balance is 0', () => {
		const { container } = render( <CreditBalance /> );
		expect( container.firstChild ).toBeNull();
	} );

	describe( 'CreditBalance component when balance is set', () => {
		const mockBalance = 10;

		beforeEach( () => {
			jest.clearAllMocks();

			// Set the balance
			const useStateSpy = jest.spyOn( React, 'useState' );
			useStateSpy.mockReturnValueOnce( [ mockBalance, jest.fn() ] );
		} );

		test( 'still returns null when credits are not enabled for the user', () => {
			// Disable credits for this user
			( useBlazeCredits as UseBlazeCreditsMock ).mockReturnValue( BlazeCreditStatus.DISABLED );

			// Render the component
			const { container } = render( <CreditBalance /> );

			// Expectations
			expect( container.firstChild ).toBeNull();
		} );

		test( 'displays "Credits: $10" when balance is set to 10', () => {
			// Enable credits for this user
			( useBlazeCredits as UseBlazeCreditsMock ).mockReturnValue( BlazeCreditStatus.ENABLED );

			// Render the component
			render( <CreditBalance /> );

			// Expectations
			const balance = screen.getByText( /Credits: \$\d+/ );
			expect( balance ).toHaveTextContent( `Credits: $${ mockBalance }` );
		} );
	} );
} );

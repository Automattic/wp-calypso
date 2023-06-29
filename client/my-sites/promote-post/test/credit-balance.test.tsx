/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import CreditBalance from '../components/credit-balance';

jest.mock( 'calypso/data/promote-post/use-promote-post-credit-balance-query' );

describe( 'CreditBalance component', () => {
	test( 'displays null when balance is not available', () => {
		useCreditBalanceQuery.mockReturnValue( { data: undefined } );

		render( <CreditBalance /> );

		expect( screen.queryByText( /Credits: \$.+/ ) ).toBeNull();
	} );

	test( 'displays null when balance is invalid', () => {
		useCreditBalanceQuery.mockReturnValue( { data: NaN } );

		render( <CreditBalance /> );

		expect( screen.queryByText( /Credits: \$.+/ ) ).toBeNull();
	} );

	test( 'displays null when balance is 0.00', () => {
		const mockBalance = '0.00';
		useCreditBalanceQuery.mockReturnValue( { data: mockBalance } );

		render( <CreditBalance /> );

		expect( screen.queryByText( /Credits: \$.+/ ) ).toBeNull();
	} );

	test( 'displays "Credits: $10.00" when balance is set to 10', () => {
		const mockBalance = '10.00';
		useCreditBalanceQuery.mockReturnValue( { data: mockBalance } );

		render( <CreditBalance /> );

		expect( screen.getByText( /Credits: \$.+/ ) ).toHaveTextContent( 'Credits: $10.00' );
	} );
} );

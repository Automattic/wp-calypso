/**
 * @vitest-environment jsdom
 */
import { statesListQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StateSelect from '../state-select';

function renderStateSelect( props ) {
	const queryClient = new QueryClient();
	queryClient.setQueryDefaults( statesListQuery( 'in' ).queryKey, { staleTime: Infinity } );
	queryClient.setQueryData( statesListQuery( 'in' ).queryKey, [
		{ code: 'AN', name: 'Andaman and Nicobar Islands' },
		{ code: 'AP', name: 'Andhra Pradesh' },
	] );
	return renderWithProvider( <StateSelect { ...props } />, { queryClient } );
}

describe( '<StateSelect />', () => {
	const defaultProps = {
		label: 'State',
		name: 'state',
		countryCode: 'IN',
		onChange: vi.fn(),
	};

	test( 'shows the placeholder rather than the first state when there is no value', () => {
		renderStateSelect( { ...defaultProps, value: undefined } );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( '' );
		expect( screen.getByRole( 'option', { name: 'Select State' } ).selected ).toBe( true );
	} );

	test( 'shows the placeholder rather than the first state when the value is empty', () => {
		renderStateSelect( { ...defaultProps, value: '' } );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( '' );
	} );

	test( 'shows the selected state when there is a value', () => {
		renderStateSelect( { ...defaultProps, value: 'AP' } );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( 'AP' );
	} );
} );

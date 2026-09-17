/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import countryStatesReducer from 'calypso/state/country-states/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StateSelect from '../state-select';

const reducers = { countryStates: countryStatesReducer };

const initialState = {
	countryStates: {
		items: {
			in: [
				{ code: 'AN', name: 'Andaman and Nicobar Islands' },
				{ code: 'AP', name: 'Andhra Pradesh' },
			],
		},
		isFetching: {},
	},
};

describe( '<StateSelect />', () => {
	const defaultProps = {
		label: 'State',
		name: 'state',
		countryCode: 'IN',
		onChange: jest.fn(),
	};

	test( 'shows the placeholder rather than the first state when there is no value', () => {
		renderWithProvider( <StateSelect { ...defaultProps } value={ undefined } />, {
			initialState,
			reducers,
		} );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( '' );
		expect( screen.getByRole( 'option', { name: 'Select State' } ).selected ).toBe( true );
	} );

	test( 'shows the placeholder rather than the first state when the value is empty', () => {
		renderWithProvider( <StateSelect { ...defaultProps } value="" />, { initialState, reducers } );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( '' );
	} );

	test( 'shows the selected state when there is a value', () => {
		renderWithProvider( <StateSelect { ...defaultProps } value="AP" />, {
			initialState,
			reducers,
		} );

		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( 'AP' );
	} );
} );

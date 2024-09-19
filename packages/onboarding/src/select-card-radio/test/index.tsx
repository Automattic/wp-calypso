/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SelectCardRadio } from '../';

describe( 'SelectCardRadio', () => {
	const option = {
		label: 'Some label',
		description: 'Some description',
		value: 'some-value',
	};

	const defaultProps = {
		option: option,
		onChange: jest.fn(),
		name: 'radio-name',
	};

	it( 'shows all available options', () => {
		render( <SelectCardRadio { ...defaultProps } /> );

		expect( screen.getByText( /Some label/ ) ).toBeVisible();
		expect( screen.getByText( /Some description/ ) ).toBeVisible();
	} );

	it( 'starts with an option selected by default', () => {
		const selectedOption = {
			label: 'Selected',
			description: 'Some description',
			value: 'some-value',
			selected: true,
		};

		render( <SelectCardRadio { ...defaultProps } option={ selectedOption } /> );

		expect( screen.getByRole( 'radio', { name: /Selected/ } ) ).toBeChecked();
	} );

	it( 'trigges the onChange event when an option is selected', async () => {
		const onChange = jest.fn();
		render( <SelectCardRadio { ...defaultProps } onChange={ onChange } /> );

		await userEvent.click( screen.getByRole( 'radio' ) );

		expect( onChange ).toHaveBeenCalledWith( option.value );
	} );
} );

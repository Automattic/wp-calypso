/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Select from '../select';

describe( '<Select />', () => {
	const defaultProps = {
		label: 'Select label',
		name: 'select',
		onChange: jest.fn(),
		options: [
			{ label: 'uno', value: 1 },
			{ label: 'due', value: 2 },
		],
		value: '',
		additionalClasses: 'mega-selectzilla',
		errorMessage: null,
	};

	test( 'should render expected output', () => {
		const { container } = render( <Select { ...defaultProps } /> );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should render form validation when there is an error', () => {
		const newProps = {
			...defaultProps,
			errorMessage: 'Duh duh duh!',
		};
		render( <Select { ...newProps } /> );
		expect( screen.getByText( 'Duh duh duh!' ) ).toBeVisible();
	} );
} );

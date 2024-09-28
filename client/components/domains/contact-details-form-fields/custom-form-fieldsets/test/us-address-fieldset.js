/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UsAddressFieldset from '../us-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: () => ( x ) => x,
} ) );

describe( 'US Address Fieldset', () => {
	const defaultProps = {
		countryCode: 'US',
		getFieldProps: ( name ) => ( { name, value: '' } ),
	};

	const propsWithoutPostalCode = {
		...defaultProps,
		arePostalCodesSupported: false,
	};

	test( 'should render correctly with default props', () => {
		const { container } = renderWithProvider( <UsAddressFieldset { ...defaultProps } /> );
		expect( container.getElementsByClassName( 'us-address-fieldset' ) ).toHaveLength( 1 );
	} );

	test( 'should render expected input components', () => {
		renderWithProvider( <UsAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'City' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'State' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	test( 'should render all expected input components but postal code', () => {
		renderWithProvider( <UsAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( screen.queryByLabelText( 'City' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'State' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Postal Code' ) ).not.toBeInTheDocument();
	} );
} );

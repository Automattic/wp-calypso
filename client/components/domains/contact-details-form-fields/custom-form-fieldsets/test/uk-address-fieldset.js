/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import UkAddressFieldset from '../uk-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: () => ( x ) => x,
} ) );

describe( 'UK Address Fieldset', () => {
	const defaultProps = {
		getFieldProps: ( name ) => ( { name, value: '' } ),
		translate: ( string ) => string,
	};

	const propsWithoutPostalCode = {
		...defaultProps,
		arePostalCodesSupported: false,
	};

	test( 'should render correctly with default props', () => {
		const { container } = render( <UkAddressFieldset { ...defaultProps } /> );
		expect( container.getElementsByClassName( 'uk-address-fieldset' ) ).toHaveLength( 1 );
	} );

	test( 'should render expected input components', () => {
		render( <UkAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'City' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Postal Code' ) ).toBeInTheDocument();
	} );

	test( 'should not render a state select components', () => {
		render( <UkAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'State' ) ).not.toBeInTheDocument();
	} );

	test( 'should render all expected input components but postal code', () => {
		render( <UkAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( screen.queryByLabelText( 'City' ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Postal Code' ) ).not.toBeInTheDocument();
	} );
} );

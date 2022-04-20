/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { expect } from 'chai';
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
		expect( container.getElementsByClassName( 'uk-address-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render expected input components', () => {
		const { container } = render( <UkAddressFieldset { ...defaultProps } /> );
		expect( container.querySelectorAll( '[name="city"]' ) ).to.have.length( 1 );
		expect( container.querySelectorAll( '[name="postal-code"]' ) ).to.have.length( 1 );
	} );

	test( 'should not render a state select components', () => {
		const { container } = render( <UkAddressFieldset { ...defaultProps } /> );
		expect( container.querySelectorAll( '[name="state"]' ) ).to.have.length( 0 );
	} );

	test( 'should render all expected input components but postal code', () => {
		const { container } = render( <UkAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( container.querySelectorAll( '[name="city"]' ) ).to.have.length( 1 );
		expect( container.querySelectorAll( '[name="postal-code"]' ) ).to.have.length( 0 );
	} );
} );

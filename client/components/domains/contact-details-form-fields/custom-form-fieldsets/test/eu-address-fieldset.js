/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import EuAddressFieldset from '../eu-address-fieldset';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: () => ( x ) => x,
} ) );

describe( 'EU Address Fieldset', () => {
	const defaultProps = {
		getFieldProps: ( name ) => ( { name, value: '' } ),
		translate: ( string ) => string,
	};

	const propsWithoutPostalCode = {
		...defaultProps,
		arePostalCodesSupported: false,
	};

	test( 'should render correctly with default props', () => {
		const { container } = render( <EuAddressFieldset { ...defaultProps } /> );
		expect( container.getElementsByClassName( 'eu-address-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render expected input components', () => {
		render( <EuAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'City' ) ).to.exist;
		expect( screen.queryByLabelText( 'Postal Code' ) ).to.exist;
	} );

	test( 'should not render a state select components', () => {
		render( <EuAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'State' ) ).to.not.exist;
	} );

	test( 'should render all expected input components but postal code', () => {
		render( <EuAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( screen.queryByLabelText( 'City' ) ).to.exist;
		expect( screen.queryByLabelText( 'Postal Code' ) ).to.not.exist;
	} );
} );

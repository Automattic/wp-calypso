/**
 * @jest-environment jsdom
 */
import { expect } from 'chai';
import { render, screen } from 'calypso/test-helpers/config/testing-library';
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
		translate: ( string ) => string,
	};

	const propsWithoutPostalCode = {
		...defaultProps,
		arePostalCodesSupported: false,
	};

	test( 'should render correctly with default props', () => {
		const { container } = render( <UsAddressFieldset { ...defaultProps } /> );
		expect( container.getElementsByClassName( 'us-address-fieldset' ) ).to.have.length( 1 );
	} );

	test( 'should render expected input components', () => {
		render( <UsAddressFieldset { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'City' ) ).to.exist;
		expect( screen.queryByLabelText( 'State' ) ).to.exist;
		expect( screen.queryByLabelText( 'ZIP code' ) ).to.exist;
	} );

	test( 'should render all expected input components but postal code', () => {
		render( <UsAddressFieldset { ...propsWithoutPostalCode } /> );
		expect( screen.queryByLabelText( 'City' ) ).to.exist;
		expect( screen.queryByLabelText( 'State' ) ).to.exist;
		expect( screen.queryByLabelText( 'Postal Code' ) ).to.not.exist;
	} );
} );

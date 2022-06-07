/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from '../constants';
import { RegionAddressFieldsets } from '../region-address-fieldsets';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: () => ( x ) => x,
} ) );

describe( 'Region Address Fieldsets', () => {
	const defaultProps = {
		getFieldProps: ( name ) => ( {
			value: '',
			name,
		} ),
		hasCountryStates: false,
		translate: ( string ) => string,
	};

	const propsWithStates = {
		getFieldProps: ( name ) => ( {
			value: '',
			name,
		} ),
		hasCountryStates: true,
		translate: ( string ) => string,
	};

	test( 'should render `<UsAddressFieldset />` with default props', () => {
		const { container } = renderWithProvider( <RegionAddressFieldsets { ...defaultProps } /> );
		expect( container.getElementsByClassName( 'us-address-fieldset' ) ).toHaveLength( 1 );
		expect( screen.queryByLabelText( 'Address' ) ).toBeInTheDocument();
		expect( screen.queryByText( '+ Add Address Line 2' ) ).toBeInTheDocument();
	} );

	test( 'should render `<UkAddressFieldset />` with a UK region countryCode', () => {
		const { container } = renderWithProvider(
			<RegionAddressFieldsets
				{ ...defaultProps }
				countryCode={ CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( container.getElementsByClassName( 'uk-address-fieldset' ) ).toHaveLength( 1 );
	} );

	test( 'should render `<EuAddressFieldset />` with an EU region countryCode', () => {
		const { container } = renderWithProvider(
			<RegionAddressFieldsets
				{ ...defaultProps }
				countryCode={ CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( container.getElementsByClassName( 'eu-address-fieldset' ) ).toHaveLength( 1 );
	} );

	test( 'should render `<UsAddressFieldset />` with an EU region country that has states', () => {
		const { container } = renderWithProvider(
			<RegionAddressFieldsets
				{ ...propsWithStates }
				countryCode={ CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( container.getElementsByClassName( 'us-address-fieldset' ) ).toHaveLength( 1 );
		expect( container.getElementsByClassName( 'eu-address-fieldset' ) ).toHaveLength( 0 );
	} );

	test( 'should render `<UsAddressFieldset />` with a UK region country that has states', () => {
		const { container } = renderWithProvider(
			<RegionAddressFieldsets
				{ ...propsWithStates }
				countryCode={ CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ] }
			/>
		);
		expect( container.getElementsByClassName( 'us-address-fieldset' ) ).toHaveLength( 1 );
		expect( container.getElementsByClassName( 'uk-address-fieldset' ) ).toHaveLength( 0 );
	} );
} );

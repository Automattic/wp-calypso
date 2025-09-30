/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RegionAddressFieldsets, RegionAddressFieldsLayout } from '../../region-address-fieldsets';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from '../constants';

jest.mock( '@wordpress/compose', () => ( {
	useViewportMatch: jest.fn( () => false ), // Default to desktop view
} ) );

jest.mock( '@wordpress/components', () => ( {
	__experimentalInputControl: ( { label, value, onChange, placeholder } ) => (
		<input
			aria-label={ label }
			placeholder={ placeholder }
			value={ value }
			onChange={ ( e ) => onChange( e.target.value ) }
		/>
	),
	SelectControl: ( { label, value, onChange, options } ) => (
		<select aria-label={ label } value={ value } onChange={ ( e ) => onChange( e.target.value ) }>
			{ options.map( ( option ) => (
				<option key={ option.value } value={ option.value }>
					{ option.label }
				</option>
			) ) }
		</select>
	),
} ) );

// Test component that renders a specific field's Edit component
const TestFieldEdit = ( { field, data = {}, onChange = () => {} } ) => {
	if ( ! field.Edit ) {
		return <div data-testid="no-edit-component">No Edit component</div>;
	}

	return (
		<field.Edit field={ field } data={ data } onChange={ onChange } hideLabelFromVision={ false } />
	);
};

describe( 'Region Address Fieldsets', () => {
	const mockStatesListUS = [
		{ code: 'CA', name: 'California' },
		{ code: 'NY', name: 'New York' },
	];

	const mockStatesListCA = [
		{ code: 'ON', name: 'Ontario' },
		{ code: 'BC', name: 'British Columbia' },
	];

	describe( 'RegionAddressFieldsets function', () => {
		test( 'should return standard address fields for US without states', () => {
			const fields = RegionAddressFieldsets( undefined, 'US' );

			expect( fields ).toHaveLength( 5 ); // address1, address2, city, state, postalCode
			expect( fields.find( ( f ) => f.id === 'address1' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'address2' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'city' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'state' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'postalCode' ) ).toBeDefined();
		} );

		test( 'should return fields with custom state component when states list is provided', () => {
			const fields = RegionAddressFieldsets( mockStatesListUS, 'US' );
			const stateField = fields.find( ( f ) => f.id === 'state' );

			expect( stateField ).toBeDefined();
			expect( stateField.Edit ).toBeDefined();
		} );

		test( 'should use ZIP code label for US postal code', () => {
			const fields = RegionAddressFieldsets( undefined, 'US' );
			const postalCodeField = fields.find( ( f ) => f.id === 'postalCode' );

			expect( postalCodeField.label ).toBe( 'ZIP code' );
		} );

		test( 'should use Postal Code label for non-US countries', () => {
			const fields = RegionAddressFieldsets( undefined, 'CA' );
			const postalCodeField = fields.find( ( f ) => f.id === 'postalCode' );

			expect( postalCodeField.label ).toBe( 'Postal Code' );
		} );

		test( 'should mark required fields as required', () => {
			const fields = RegionAddressFieldsets( undefined, 'US' );

			expect( fields.find( ( f ) => f.id === 'address1' ).isValid.required ).toBe( true );
			expect( fields.find( ( f ) => f.id === 'city' ).isValid.required ).toBe( true );
			expect( fields.find( ( f ) => f.id === 'postalCode' ).isValid.required ).toBe( true );
			expect( fields.find( ( f ) => f.id === 'address2' ).isValid ).toBeUndefined();
		} );
	} );

	describe( 'RegionAddressFieldsLayout function', () => {
		test( 'should return EU layout for EU countries without states', () => {
			const layout = RegionAddressFieldsLayout( {
				statesList: undefined,
				countryCode: CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ],
			} );

			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'postalCode', 'city' ],
				},
			] );
		} );

		test( 'should return UK layout for UK countries without states', () => {
			const layout = RegionAddressFieldsLayout( {
				statesList: undefined,
				countryCode: CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ],
			} );

			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'city', 'postalCode' ],
				},
			] );
		} );

		test( 'should return US layout for countries with states (desktop)', () => {
			const { useViewportMatch } = require( '@wordpress/compose' );
			useViewportMatch.mockReturnValue( false );

			const layout = RegionAddressFieldsLayout( {
				statesList: mockStatesListUS,
				countryCode: CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ],
			} );

			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'city', 'state', 'postalCode' ],
				},
			] );
		} );

		test( 'should return US layout for countries with states (mobile)', () => {
			const { useViewportMatch } = require( '@wordpress/compose' );
			useViewportMatch.mockReturnValue( true );

			const layout = RegionAddressFieldsLayout( {
				statesList: mockStatesListUS,
				countryCode: CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ],
			} );

			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'city', 'state' ],
				},
				'postalCode',
			] );
		} );
	} );

	describe( 'State field behavior', () => {
		test( 'should render input control when no states list provided', () => {
			const fields = RegionAddressFieldsets( undefined, 'US' );
			const stateField = fields.find( ( f ) => f.id === 'state' );

			render( <TestFieldEdit field={ stateField } data={ { state: '' } } /> );

			const stateInput = screen.getByLabelText( 'Select State' );
			expect( stateInput ).toBeInTheDocument();
			expect( stateInput.tagName ).toBe( 'INPUT' );
		} );

		test( 'should render select control when states list provided', () => {
			const fields = RegionAddressFieldsets( mockStatesListUS, 'US' );
			const stateField = fields.find( ( f ) => f.id === 'state' );

			render( <TestFieldEdit field={ stateField } data={ { state: 'CA' } } /> );

			const stateSelect = screen.getByLabelText( 'Select State' );
			expect( stateSelect ).toBeInTheDocument();
			expect( stateSelect.tagName ).toBe( 'SELECT' );
		} );

		test( 'should use correct state label for Canada', () => {
			const fields = RegionAddressFieldsets( mockStatesListCA, 'CA' );
			const stateField = fields.find( ( f ) => f.id === 'state' );

			render( <TestFieldEdit field={ stateField } data={ { state: 'ON' } } /> );

			const stateSelect = screen.getByLabelText( 'Select Province' );
			expect( stateSelect ).toBeInTheDocument();
		} );

		test( 'should populate select options from states list', () => {
			const fields = RegionAddressFieldsets( mockStatesListUS, 'US' );
			const stateField = fields.find( ( f ) => f.id === 'state' );

			render( <TestFieldEdit field={ stateField } data={ { state: 'CA' } } /> );

			expect( screen.getByText( 'California' ) ).toBeInTheDocument();
			expect( screen.getByText( 'New York' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Integration with original test scenarios', () => {
		test( 'should handle default US behavior (equivalent to old UsAddressFieldset)', () => {
			const fields = RegionAddressFieldsets( undefined, 'US' );
			const layout = RegionAddressFieldsLayout( { statesList: undefined, countryCode: 'US' } );

			// Should have all standard address fields
			expect( fields.find( ( f ) => f.id === 'address1' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'address2' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'city' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'state' ) ).toBeDefined();
			expect( fields.find( ( f ) => f.id === 'postalCode' ) ).toBeDefined();

			// Should use default layout (mobile-style since no states list means mobile layout)
			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'city', 'state' ],
				},
				'postalCode',
			] );
		} );

		test( 'should handle UK region behavior (equivalent to old UkAddressFieldset)', () => {
			const countryCode = CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ];
			const layout = RegionAddressFieldsLayout( { statesList: undefined, countryCode } );

			// Should use UK-style layout (city before postal code)
			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'city', 'postalCode' ],
				},
			] );
		} );

		test( 'should handle EU region behavior (equivalent to old EuAddressFieldset)', () => {
			const countryCode = CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ];
			const layout = RegionAddressFieldsLayout( { statesList: undefined, countryCode } );

			// Should use EU-style layout (postal code before city)
			expect( layout ).toEqual( [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row',
						alignment: 'start',
					},
					children: [ 'postalCode', 'city' ],
				},
			] );
		} );

		test( 'should override EU layout when country has states (equivalent to old behavior)', () => {
			const countryCode = CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ];
			const layout = RegionAddressFieldsLayout( { statesList: mockStatesListUS, countryCode } );

			// Should use US-style layout even for EU country when states are present
			expect( layout ).toEqual(
				expect.arrayContaining( [
					'address1',
					'address2',
					expect.objectContaining( {
						children: expect.arrayContaining( [ 'city', 'state' ] ),
					} ),
				] )
			);
		} );

		test( 'should override UK layout when country has states (equivalent to old behavior)', () => {
			const countryCode = CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES[ 0 ];
			const layout = RegionAddressFieldsLayout( { statesList: mockStatesListUS, countryCode } );

			// Should use US-style layout even for UK country when states are present
			expect( layout ).toEqual(
				expect.arrayContaining( [
					'address1',
					'address2',
					expect.objectContaining( {
						children: expect.arrayContaining( [ 'city', 'state' ] ),
					} ),
				] )
			);
		} );
	} );
} );

/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../test-utils';
import {
	TaxLocationForm,
	calculateTaxLocationFields,
	defaultTaxLocation,
} from '../tax-location-form';
import type { CountryListItem, StoredPaymentMethodTaxLocation } from '@automattic/api-core';

const unitedStates = {
	code: 'US',
	name: 'United States',
	has_postal_codes: true,
	tax_needs_subdivision: true,
} as CountryListItem;

const france = {
	code: 'FR',
	name: 'France',
	has_postal_codes: true,
} as CountryListItem;

function fieldsFor(
	taxLocation: StoredPaymentMethodTaxLocation,
	{
		selectedCountryItem = unitedStates,
		allowIsForBusinessCheckbox = true,
	}: { selectedCountryItem?: CountryListItem; allowIsForBusinessCheckbox?: boolean } = {}
) {
	return calculateTaxLocationFields( {
		selectedCountryItem,
		taxLocation,
		allowIsForBusinessCheckbox,
	} );
}

describe( 'calculateTaxLocationFields business use field', () => {
	test.each( [
		[ 'the first Ohio postal code', '43000' ],
		[ 'a mid-range Ohio postal code', '44101' ],
		[ 'the last Ohio postal code', '45999' ],
		[ 'the first Connecticut postal code', '06000' ],
		[ 'the last Connecticut postal code before the gap', '06389' ],
		[ 'the first Connecticut postal code after the gap', '06391' ],
		[ 'the last Connecticut postal code', '06999' ],
	] )( 'includes is_for_business for %s', ( _label, postalCode ) => {
		expect( fieldsFor( { country_code: 'US', postal_code: postalCode } ) ).toContain(
			'is_for_business'
		);
	} );

	test.each( [
		[ 'a postal code just below Ohio', '42999' ],
		[ 'a postal code just above Ohio', '46000' ],
		[ 'the Fishers Island gap in the Connecticut range', '06390' ],
		[ 'a postal code just below Connecticut', '05999' ],
		[ 'a postal code just above Connecticut', '07000' ],
		[ 'a California postal code', '94107' ],
	] )( 'excludes is_for_business for %s', ( _label, postalCode ) => {
		expect( fieldsFor( { country_code: 'US', postal_code: postalCode } ) ).not.toContain(
			'is_for_business'
		);
	} );

	test( 'excludes is_for_business when no postal code has been entered', () => {
		expect( fieldsFor( { country_code: 'US', postal_code: '' } ) ).not.toContain(
			'is_for_business'
		);
	} );

	test( 'excludes is_for_business outside the US even if the postal code digits match', () => {
		expect(
			fieldsFor( { country_code: 'FR', postal_code: '44101' }, { selectedCountryItem: france } )
		).not.toContain( 'is_for_business' );
	} );

	test( 'excludes is_for_business when the caller has not opted in', () => {
		expect(
			fieldsFor(
				{ country_code: 'US', postal_code: '44101' },
				{ allowIsForBusinessCheckbox: false }
			)
		).not.toContain( 'is_for_business' );
	} );
} );

describe( '<TaxLocationForm>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-countries' ) )
			.reply( 200, [ unitedStates, france ] )
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-states/' ) )
			.reply( 200, [] );
	} );

	const ControlledTaxLocationForm = ( {
		initialData,
		allowIsForBusinessCheckbox,
		onDataChange,
	}: {
		initialData: StoredPaymentMethodTaxLocation;
		allowIsForBusinessCheckbox?: boolean;
		onDataChange?: ( data: StoredPaymentMethodTaxLocation ) => void;
	} ) => {
		const [ data, setData ] = useState( initialData );
		return (
			<TaxLocationForm
				data={ data }
				allowIsForBusinessCheckbox={ allowIsForBusinessCheckbox }
				onChange={ ( updated ) => {
					const newData = { ...data, ...updated };
					setData( newData );
					onDataChange?.( newData );
				} }
			/>
		);
	};

	test( 'shows the business use checkbox for an Ohio postal code', async () => {
		render(
			<ControlledTaxLocationForm
				initialData={ { ...defaultTaxLocation, country_code: 'US', postal_code: '44101' } }
				allowIsForBusinessCheckbox
			/>
		);

		expect(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		).toBeVisible();
	} );

	test( 'hides the business use checkbox for a California postal code', async () => {
		render(
			<ControlledTaxLocationForm
				initialData={ { ...defaultTaxLocation, country_code: 'US', postal_code: '94107' } }
				allowIsForBusinessCheckbox
			/>
		);

		await waitFor( () => expect( screen.getByLabelText( 'Postal code' ) ).toBeVisible() );
		expect(
			screen.queryByRole( 'checkbox', { name: /is this purchase for business/i } )
		).not.toBeInTheDocument();
	} );

	test( 'reports the business use selection to the caller', async () => {
		const onDataChange = jest.fn();
		render(
			<ControlledTaxLocationForm
				initialData={ { ...defaultTaxLocation, country_code: 'US', postal_code: '44101' } }
				allowIsForBusinessCheckbox
				onDataChange={ onDataChange }
			/>
		);

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		);

		expect( onDataChange ).toHaveBeenCalledWith(
			expect.objectContaining( { is_for_business: true } )
		);
	} );

	test( 'clears a business use selection once the location stops being eligible', async () => {
		const onDataChange = jest.fn();
		render(
			<ControlledTaxLocationForm
				initialData={ { ...defaultTaxLocation, country_code: 'US', postal_code: '44101' } }
				allowIsForBusinessCheckbox
				onDataChange={ onDataChange }
			/>
		);

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: /is this purchase for business/i } )
		);
		await userEvent.clear( screen.getByLabelText( 'Postal code' ) );
		await userEvent.type( screen.getByLabelText( 'Postal code' ), '94107' );

		expect( onDataChange ).toHaveBeenLastCalledWith(
			expect.objectContaining( { postal_code: '94107', is_for_business: undefined } )
		);
	} );
} );

/**
 * @jest-environment jsdom
 */
import { geolocateCurrencySymbol, setDefaultLocale } from '@automattic/format-currency';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PlanPrice from '../index';

describe( 'PlanPrice', () => {
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		setDefaultLocale( 'en-US' );
		globalThis.fetch = originalFetch;
	} );

	it( 'renders a zero when rawPrice is passed a "0"', () => {
		render( <PlanPrice rawPrice={ 0 } /> );
		expect( document.body ).toHaveTextContent( '$0' );
	} );

	it( 'renders a rawPrice of $50', () => {
		render( <PlanPrice rawPrice={ 50 } /> );
		expect( document.body ).toHaveTextContent( '$50' );
	} );

	it( 'renders a rawPrice with a decimal', () => {
		render( <PlanPrice rawPrice={ 50.01 } /> );
		expect( document.body ).toHaveTextContent( '$50.01' );
		expect( screen.queryByText( '50.01' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '50' ) ).toBeInTheDocument();
		expect( screen.getByText( '.01' ) ).toBeInTheDocument();
	} );

	it( 'renders a rawPrice if isSmallestUnit is set', () => {
		render( <PlanPrice rawPrice={ 5001 } isSmallestUnit /> );
		expect( document.body ).toHaveTextContent( '$50.01' );
		expect( screen.queryByText( '50.01' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '50' ) ).toBeInTheDocument();
		expect( screen.getByText( '.01' ) ).toBeInTheDocument();
	} );

	it( 'renders a range of prices', () => {
		render( <PlanPrice rawPrice={ [ 10, 50 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50' );
		expect( screen.queryByText( '$10-50' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '10' ) ).toBeInTheDocument();
		expect( screen.getByText( '50' ) ).toBeInTheDocument();
	} );

	it( 'renders a range of prices with decimals', () => {
		render( <PlanPrice rawPrice={ [ 10, 50.01 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50.01' );
		expect( screen.queryByText( '$10-50.01' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '10' ) ).toBeInTheDocument();
		expect( screen.getByText( '50' ) ).toBeInTheDocument();
		expect( screen.getByText( '.01' ) ).toBeInTheDocument();
	} );

	it( 'will not render a range of prices with a 0', () => {
		render( <PlanPrice rawPrice={ [ 10, 0 ] } /> );
		expect( document.body ).not.toHaveTextContent( '$10-0' );
		expect( screen.queryByText( '$10-0' ) ).not.toBeInTheDocument();
	} );

	it( 'will use productDisplayPrice when rawPrice is a number', () => {
		render(
			<PlanPrice
				rawPrice={ 10 }
				productDisplayPrice='<abbr title="United States Dollars">$</abbr>96.00'
			/>
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( document.body ).not.toHaveTextContent( '$10' );
		expect( screen.queryByText( '$96.00' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '96.00' ) ).toBeInTheDocument();
		expect( screen.getByTitle( 'United States Dollars' ) ).toBeInTheDocument();
	} );

	it( 'will use productDisplayPrice when rawPrice is an array with length of 1', () => {
		render(
			<PlanPrice
				rawPrice={ [ 10 ] }
				productDisplayPrice='<abbr title="United States Dollars">$</abbr>96.00'
			/>
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( document.body ).not.toHaveTextContent( '$10' );
		expect( screen.queryByText( '$96.00' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '96.00' ) ).toBeInTheDocument();
		expect( screen.getByTitle( 'United States Dollars' ) ).toBeInTheDocument();
	} );

	it( 'will use rawPrice over productDisplayPrice when rawPrice is passed an array with length > 1', () => {
		render(
			<PlanPrice
				rawPrice={ [ 5, 10 ] }
				productDisplayPrice='<abbr title="United States Dollars">$</abbr>96.00'
			/>
		);
		expect( document.body ).toHaveTextContent( '$5-10' );
		expect( document.body ).not.toHaveTextContent( '$96.00' );
		expect( screen.getByText( '5' ) ).toBeInTheDocument();
		expect( screen.getByText( '10' ) ).toBeInTheDocument();
		expect( screen.queryByTitle( 'United States Dollars' ) ).not.toBeInTheDocument();
	} );

	it( 'ignores currencyCode when productDisplayPrice is set', () => {
		render(
			<PlanPrice
				productDisplayPrice='<abbr title="United States Dollars">$</abbr>96.00'
				currencyCode="IDR"
			/>
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( screen.getByTitle( 'United States Dollars' ) ).toBeInTheDocument();
	} );

	it( 'renders a currency when set', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode="EUR" /> );
		expect( document.body ).toHaveTextContent( '€5.05' );
		expect( screen.queryByText( '€5.05' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '5' ) ).toBeInTheDocument();
		expect( screen.getByText( '.05' ) ).toBeInTheDocument();
	} );

	it( 'renders USD currency when currency is undefined', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode={ undefined } /> );
		expect( document.body ).toHaveTextContent( '$5.05' );
		expect( screen.queryByText( '$5.05' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '5' ) ).toBeInTheDocument();
		expect( screen.getByText( '.05' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing when currency is null', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode={ null } /> );
		expect( document.body ).not.toHaveTextContent( '$5.05' );
	} );

	it( 'renders no decimal section when price is integer', () => {
		render( <PlanPrice rawPrice={ 44700 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700' );
		expect( document.body ).not.toHaveTextContent( 'Rp44,700.00' );
		expect( screen.queryByText( 'Rp44,700' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '44,700' ) ).toBeInTheDocument();
	} );

	it( 'renders a decimal section when price is not integer', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.queryByText( 'Rp 44,700' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '44,700' ) ).toBeInTheDocument();
		expect( screen.getByText( '.50' ) ).toBeInTheDocument();
	} );

	it( 'renders a price without html when displayFlatPrice is set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" displayFlatPrice /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.getByText( 'Rp44,700.50' ) ).toBeInTheDocument();
	} );

	it( 'renders a price without html when displayFlatPrice and isSmallestUnit are set', () => {
		render( <PlanPrice rawPrice={ 4470050 } currencyCode="IDR" isSmallestUnit displayFlatPrice /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.getByText( 'Rp44,700.50' ) ).toBeInTheDocument();
	} );

	it( 'renders a price without sale text when displayFlatPrice is set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" displayFlatPrice isOnSale /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.getByText( 'Rp44,700.50' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Sale' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price without sale text when productDisplayPrice is set', () => {
		render(
			<PlanPrice productDisplayPrice='<abbr title="United States Dollars">$</abbr>96.00' isOnSale />
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( screen.queryByText( 'Sale' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price with sale text when using rawPrice and isOnSale', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" isOnSale /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.getByText( 'Sale' ) ).toBeInTheDocument();
	} );

	it( 'renders a price with monthly text when using rawPrice and displayPerMonthNotation', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" displayPerMonthNotation /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		// Note: there is a newline between "per" and "month" but testing-library cannot detect those.
		expect( screen.getByText( 'permonth' ) ).toBeInTheDocument();
	} );

	it( 'renders a price without monthly text when using productDisplayPrice and displayPerMonthNotation', () => {
		render( <PlanPrice productDisplayPrice="$96.00" currencyCode="IDR" displayPerMonthNotation /> );
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( screen.queryByText( /per/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price with $ when using displayFlatPrice and US locale', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'US' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		await geolocateCurrencySymbol();
		render( <PlanPrice rawPrice={ 96.05 } currencyCode="USD" displayFlatPrice /> );
		expect( document.body ).toHaveTextContent( '$96.05' );
		expect( document.body ).not.toHaveTextContent( 'US$96.05' );
	} );

	it( 'renders a price with US$ when using displayFlatPrice and non-US locale', async () => {
		globalThis.fetch = jest.fn(
			( url: string ) =>
				Promise.resolve( {
					json: () =>
						url.includes( '/geo' )
							? Promise.resolve( { country_short: 'CA' } )
							: Promise.resolve( 'invalid' ),
				} ) as any
		);
		await geolocateCurrencySymbol();
		render( <PlanPrice rawPrice={ 96.05 } currencyCode="USD" displayFlatPrice /> );
		expect( document.body ).toHaveTextContent( 'US$96.05' );
	} );

	it( 'renders a price without monthly text when using displayFlatPrice and displayPerMonthNotation', () => {
		render(
			<PlanPrice rawPrice={ 96.05 } currencyCode="USD" displayFlatPrice displayPerMonthNotation />
		);
		expect( document.body ).toHaveTextContent( '$96.05' );
		expect( screen.queryByText( /per/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price with tax text when using rawPrice and taxText', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" taxText="25" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50(+25 tax)' );
		expect( screen.getByText( '(+25 tax)' ) ).toBeInTheDocument();
	} );

	it( 'renders a price without tax text when using productDisplayPrice and taxText', () => {
		render( <PlanPrice productDisplayPrice="$96.00" currencyCode="IDR" taxText="25" /> );
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( screen.queryByText( '(+25 tax)' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price without tax text when using displayFlatPrice and taxText', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" displayFlatPrice taxText="25" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( screen.queryByText( '(+25 tax)' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a price with a heading tag if omitHeading is false', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'h4' ) ).toBeTruthy();
	} );

	it( 'renders a price with a non-heading tag if omitHeading is true', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" omitHeading /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'h4' ) ).toBeFalsy();
	} );

	it( 'renders a price with a heading tag if productDisplayPrice is set and omitHeading is false', () => {
		render( <PlanPrice productDisplayPrice="Rp44,700.50" currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'h4' ) ).toBeTruthy();
	} );

	it( 'renders a price with a non-heading tag if productDisplayPrice is set and omitHeading is true', () => {
		render( <PlanPrice productDisplayPrice="Rp44,700.50" currencyCode="IDR" omitHeading /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'h4' ) ).toBeFalsy();
	} );

	it( 'renders a price without an outer div if priceDisplayWrapperClassName is not set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'div.foo-price-display-wrapper-class' ) ).toBeFalsy();
	} );

	it( 'renders a price with an outer div if priceDisplayWrapperClassName is set', () => {
		render(
			<PlanPrice
				rawPrice={ 44700.5 }
				currencyCode="IDR"
				priceDisplayWrapperClassName="foo-price-display-wrapper-class"
			/>
		);
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'div.foo-price-display-wrapper-class' ) ).toBeTruthy();
	} );

	it( 'renders a price without an outer div if productDisplayPrice is set and priceDisplayWrapperClassName is set', () => {
		render(
			<PlanPrice
				productDisplayPrice="$45"
				priceDisplayWrapperClassName="foo-price-display-wrapper-class"
			/>
		);
		expect( document.body ).toHaveTextContent( '$45' );
		expect( document.querySelector( 'div.foo-price-display-wrapper-class' ) ).toBeFalsy();
	} );

	it( 'renders a price without an outer div if displayFlatPrice is set and priceDisplayWrapperClassName is set', () => {
		render(
			<PlanPrice
				rawPrice={ 44700.5 }
				currencyCode="IDR"
				displayFlatPrice
				priceDisplayWrapperClassName="foo-price-display-wrapper-class"
			/>
		);
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( 'div.foo-price-display-wrapper-class' ) ).toBeFalsy();
	} );

	it( 'renders a price without the "is-discounted" class if discounted is not set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( '.is-discounted' ) ).toBeFalsy();
	} );

	it( 'renders a price with the "is-discounted" class if discounted is set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" discounted /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( '.is-discounted' ) ).toBeTruthy();
	} );

	it( 'renders a price with the "is-discounted" class if using productDisplayPrice and discounted is set', () => {
		render( <PlanPrice productDisplayPrice="$45" discounted /> );
		expect( document.body ).toHaveTextContent( '$45' );
		expect( document.querySelector( '.is-discounted' ) ).toBeTruthy();
	} );

	it( 'renders a price without the "is-original" class if original is not set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( '.is-discounted' ) ).toBeFalsy();
	} );

	it( 'renders a price with the "is-original" class if original is set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" original /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( '.is-original' ) ).toBeTruthy();
	} );

	it( 'renders a price with the "is-original" class if using productDisplayPrice and original is set', () => {
		render( <PlanPrice productDisplayPrice="$45" original /> );
		expect( document.body ).toHaveTextContent( '$45' );
		expect( document.querySelector( '.is-original' ) ).toBeTruthy();
	} );

	it( 'renders a price with the "is-large-currency" class if isLargeCurrency is set', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" isLargeCurrency /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
		expect( document.querySelector( '.is-large-currency' ) ).toBeTruthy();
	} );

	it( 'renders the symbol to the left of the integer when symbolPosition is "before"', () => {
		setDefaultLocale( 'en-US' );
		render( <PlanPrice rawPrice={ 48 } currencyCode="CAD" /> );
		expect( document.body ).toHaveTextContent( 'C$48' );
	} );

	it( 'renders the symbol to the right of the integer when symbolPosition is "after"', () => {
		setDefaultLocale( 'fr-CA' );
		render( <PlanPrice rawPrice={ 48 } currencyCode="CAD" /> );
		expect( document.body ).toHaveTextContent( '48C$' );
	} );
} );

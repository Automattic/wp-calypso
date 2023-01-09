/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import PlanPrice from '../index';

describe( 'PlanPrice', () => {
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
	} );
	it( 'renders a range of prices', () => {
		render( <PlanPrice rawPrice={ [ 10, 50 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50' );
	} );
	it( 'renders a range of prices with decimals', () => {
		render( <PlanPrice rawPrice={ [ 10, 50.01 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50.01' );
	} );
	it( 'will not render a range of prices with a 0', () => {
		render( <PlanPrice rawPrice={ [ 10, 0 ] } /> );
		expect( document.body ).not.toHaveTextContent( '$10-0' );
	} );
	it( 'will use productDisplayPrice when rawPrice is an integer', () => {
		render(
			<PlanPrice
				rawPrice={ 10 }
				productDisplayPrice={ '<abbr title="United States Dollars">$</abbr>96.00' }
			/>
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( document.body ).not.toHaveTextContent( '$10' );
	} );
	it( 'will use productDisplayPrice when rawPrice is an array with length of 1', () => {
		render(
			<PlanPrice
				rawPrice={ [ 10 ] }
				productDisplayPrice={ '<abbr title="United States Dollars">$</abbr>96.00' }
			/>
		);
		expect( document.body ).toHaveTextContent( '$96.00' );
		expect( document.body ).not.toHaveTextContent( '$10' );
	} );
	it( 'will use rawPrice when rawPrice is passed an array with length > 1', () => {
		render(
			<PlanPrice
				rawPrice={ [ 5, 10 ] }
				productDisplayPrice={ '<abbr title="United States Dollars">$</abbr>96.00' }
			/>
		);
		expect( document.body ).toHaveTextContent( '$5-10' );
		expect( document.body ).not.toHaveTextContent( '$96.00' );
	} );

	it( 'renders a currency when set', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode="EUR" /> );
		expect( document.body ).toHaveTextContent( '€5.05' );
	} );

	it( 'renders USD currency when currency is undefined', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode={ undefined } /> );
		expect( document.body ).toHaveTextContent( '$5.05' );
	} );

	it( 'renders nothing when currency is null', () => {
		render( <PlanPrice rawPrice={ 5.05 } currencyCode={ null } /> );
		expect( document.body ).not.toHaveTextContent( '$5.05' );
	} );

	it( 'renders no decimal section when price is integer', () => {
		render( <PlanPrice rawPrice={ 44700 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700' );
		expect( document.body ).not.toHaveTextContent( 'Rp44,700.00' );
	} );

	it( 'renders a decimal section when price is not integer', () => {
		render( <PlanPrice rawPrice={ 44700.5 } currencyCode="IDR" /> );
		expect( document.body ).toHaveTextContent( 'Rp44,700.50' );
	} );
} );

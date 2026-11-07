import { formatCurrency, setLocale } from '@automattic/number-formatters';
import { render, screen } from '@testing-library/react';
import { LineItemPrice } from '../src/checkout-line-items';
import { CurrencyAmount } from '../src/currency-amount';

describe( 'CurrencyAmount', () => {
	afterEach( () => setLocale( 'en' ) );

	it.each( [
		[ 'en-US', 'USD', -140.25, {} ],
		[ 'de-DE', 'EUR', -140.25, {} ],
		[ 'he', 'ILS', -140.25, {} ],
		[ 'ar', 'AED', -140.25, {} ],
		[ 'en-US', 'USD', 140.25, { signForPositive: true } ],
		[ 'en-US', 'USD', 0, {} ],
		[ 'en-US', 'USD', -14025, { isSmallestUnit: true } ],
		[ 'en-US', 'USD', -14000, { isSmallestUnit: true, stripZeros: true } ],
	] )( 'isolates the unchanged %s/%s amount %s', ( locale, currency, amount, options ) => {
		setLocale( locale );
		const formatted = formatCurrency( amount, currency, options );
		const { container } = render(
			<div dir="rtl">
				<CurrencyAmount>{ formatted }</CurrencyAmount>
			</div>
		);
		const price = container.querySelector( 'bdi' );
		expect( price ).toBeVisible();
		expect( price ).toHaveAttribute( 'dir', 'ltr' );
		expect( price?.textContent ).toBe( formatted );
	} );

	it( 'isolates each line-item amount without including its neighboring label', () => {
		const { container } = render(
			<div dir="rtl">
				<LineItemPrice actualAmount="-140,25 €" crossedOutAmount="200,00 €" />
				<span>per month</span>
			</div>
		);
		expect( screen.getByText( '-140,25 €' ) ).toHaveAttribute( 'dir', 'ltr' );
		expect( screen.getByText( '200,00 €' ).closest( 's' ) ).toBeVisible();
		expect( container.querySelectorAll( 'bdi[dir="ltr"]' ) ).toHaveLength( 2 );
		expect( screen.getByText( 'per month' ).closest( 'bdi' ) ).toBeNull();
	} );
} );

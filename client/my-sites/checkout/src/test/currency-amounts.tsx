/**
 * @jest-environment jsdom
 */
import { checkoutTheme, FormStatus } from '@automattic/composite-checkout';
import { formatCurrency, setLocale } from '@automattic/number-formatters';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { getCouponLineItemFromCart, getCreditsLineItemFromCart } from '@automattic/wpcom-checkout';
import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponCostOverride, LineItemCostOverrides } from '../components/cost-overrides-list';
import { MobileCheckoutStickySummary } from '../components/mobile-checkout-sticky-summary';
import { WPCheckoutOrderSummary } from '../components/wp-checkout-order-summary';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ReactNode } from 'react';

let mockCart: ResponseCart;
let mockFormStatus: FormStatus = FormStatus.READY;

jest.mock( '../../../../../packages/shopping-cart/src/use-shopping-cart', () => ( {
	__esModule: true,
	default: () => ( { responseCart: mockCart } ),
} ) );
jest.mock( '../../../../../packages/composite-checkout/src/lib/form-status', () => ( {
	useFormStatus: () => ( { formStatus: mockFormStatus } ),
} ) );
jest.mock( 'calypso/state', () => ( {
	...jest.requireActual( 'calypso/state' ),
	useSelector: () => false,
} ) );
jest.mock( 'calypso/my-sites/checkout/use-cart-key', () => () => 'test-cart' );
jest.mock( 'calypso/my-sites/checkout/utils/use-equivalent-monthly-totals', () => ( {
	...jest.requireActual( 'calypso/my-sites/checkout/utils/use-equivalent-monthly-totals' ),
	__esModule: true,
	default: () => ( {} ),
} ) );

function RTLCheckout( { children }: { children: ReactNode } ) {
	return (
		<ThemeProvider theme={ checkoutTheme }>
			<div dir="rtl">{ children }</div>
		</ThemeProvider>
	);
}

describe( 'Checkout currency direction', () => {
	beforeEach( () => {
		setLocale( 'en-US' );
		mockFormStatus = FormStatus.READY;
		mockCart = {
			...getEmptyResponseCart(),
			currency: 'USD',
			coupon: 'SAVE',
			coupon_savings_total_integer: 500,
			credits_integer: 1000,
			sub_total_integer: 14000,
			sub_total_with_taxes_integer: 14000,
			total_cost_integer: 14000,
		};
	} );

	afterEach( () => setLocale( 'en' ) );

	it( 'isolates product discounts and coupon savings in RTL', () => {
		const product = { ...getEmptyResponseCartProduct(), currency: 'USD' };
		render(
			<RTLCheckout>
				<LineItemCostOverrides
					product={ product }
					costOverridesList={ [
						{
							humanReadableReason: 'Upgrade credit',
							overrideCode: 'prorated',
							discountAmount: 14000,
						},
					] }
					shouldShowDiscount
				/>
				<CouponCostOverride responseCart={ mockCart } />
			</RTLCheckout>
		);
		for ( const amount of [ -14000, -500 ] ) {
			const price = formatCurrency( amount, 'USD', { isSmallestUnit: true } );
			expect( screen.getByText( price ) ).toHaveAttribute( 'dir', 'ltr' );
		}
		expect( screen.getByText( 'Upgrade credit' ).closest( 'bdi' ) ).toBeNull();
	} );

	it( 'keeps coupon removal usable and hides the removed discount', async () => {
		const user = userEvent.setup();
		const removeCoupon = jest.fn( async () => mockCart );
		const { rerender } = render(
			<RTLCheckout>
				<CouponCostOverride responseCart={ mockCart } removeCoupon={ removeCoupon } />
			</RTLCheckout>
		);
		await user.click( screen.getByRole( 'button', { name: 'Remove coupon' } ) );
		expect( removeCoupon ).toHaveBeenCalledTimes( 1 );
		mockCart = { ...mockCart, coupon: '', coupon_savings_total_integer: 0 };
		rerender(
			<RTLCheckout>
				<CouponCostOverride responseCart={ mockCart } removeCoupon={ removeCoupon } />
			</RTLCheckout>
		);
		expect( screen.queryByText( 'Coupon: SAVE' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Remove coupon' } ) ).not.toBeInTheDocument();
	} );

	it( 'isolates desktop summary credits and replaces stale amounts while updating', () => {
		const firstCredit = getCreditsLineItemFromCart( mockCart )?.formattedAmount ?? '';
		const { rerender } = render(
			<RTLCheckout>
				<WPCheckoutOrderSummary />
			</RTLCheckout>
		);
		expect( screen.getByText( firstCredit ) ).toHaveAttribute( 'dir', 'ltr' );
		mockFormStatus = FormStatus.VALIDATING;
		rerender(
			<RTLCheckout>
				<WPCheckoutOrderSummary />
			</RTLCheckout>
		);
		expect( screen.queryByText( firstCredit ) ).not.toBeInTheDocument();
		mockCart = { ...mockCart, credits_integer: 750 };
		mockFormStatus = FormStatus.READY;
		rerender(
			<RTLCheckout>
				<WPCheckoutOrderSummary />
			</RTLCheckout>
		);
		const updatedCredit = getCreditsLineItemFromCart( mockCart )?.formattedAmount ?? '';
		expect( screen.getByText( updatedCredit ) ).toHaveAttribute( 'dir', 'ltr' );
	} );

	it( 'isolates coupon and credit amounts when opening the mobile summary', async () => {
		const user = userEvent.setup();
		render(
			<RTLCheckout>
				<MobileCheckoutStickySummary />
			</RTLCheckout>
		);
		await user.click( screen.getByRole( 'button', { name: /^Total:/ } ) );
		for ( const lineItem of [
			getCouponLineItemFromCart( mockCart ),
			getCreditsLineItemFromCart( mockCart ),
		] ) {
			const price = screen.getByText( lineItem?.formattedAmount ?? '' );
			expect( price ).toBeVisible();
			expect( price ).toHaveAttribute( 'dir', 'ltr' );
		}
	} );
} );

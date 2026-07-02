/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ProductCard } from '../index';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

jest.mock( 'calypso/jetpack-cloud/sections/partner-portal/hooks', () => ( {
	useProductDescription: () => ( { description: 'A product description' } ),
} ) );

jest.mock( '../hooks/use-custom-product-card', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '../product-price-with-discount-info', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '../../product-badges', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const product = {
	name: 'Jetpack Backup',
	slug: 'jetpack-backup',
	product_id: 2100,
	currency: 'USD',
	amount: '10',
	price_interval: 'day',
	family_slug: 'jetpack-packs',
	supported_bundles: [],
} as unknown as APIProductFamilyProduct;

const baseProps = {
	termPricing: 'monthly' as const,
	products: [ product ],
	isSelected: false,
	isDisabled: false,
	quantity: 1,
	currentProduct: product,
	setCurrentProduct: jest.fn(),
	onShowLightbox: jest.fn(),
	onSelectProduct: jest.fn(),
};

const renderCard = ( ui: React.ReactElement ) => renderWithProvider( ui );

describe( 'ProductCard quantity stepper (agency mode)', () => {
	it( 'shows "Add to cart" and a stepper defaulting to 1 when nothing is in the cart', () => {
		renderCard( <ProductCard { ...baseProps } asReferral={ false } count={ 0 } /> );

		expect( screen.getByRole( 'button', { name: 'Add to cart' } ) ).toBeVisible();
		expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 1 );
	} );

	it( 'adds the chosen pending quantity when the button is clicked', async () => {
		const user = userEvent.setup();
		const onAddToCart = jest.fn();
		renderCard(
			<ProductCard { ...baseProps } asReferral={ false } count={ 0 } onAddToCart={ onAddToCart } />
		);

		const input = screen.getByRole( 'spinbutton' );
		await user.clear( input );
		await user.type( input, '3' );

		expect( screen.getByRole( 'button', { name: 'Add 3 to cart' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Add 3 to cart' } ) );

		expect( onAddToCart ).toHaveBeenCalledWith( product, 3 );
	} );

	it( 'reflects the cart count, flips the button to remove, and syncs edits', async () => {
		const user = userEvent.setup();
		const onUpdateCartItemCount = jest.fn();
		const onRemoveFromCart = jest.fn();
		renderCard(
			<ProductCard
				{ ...baseProps }
				asReferral={ false }
				count={ 2 }
				onUpdateCartItemCount={ onUpdateCartItemCount }
				onRemoveFromCart={ onRemoveFromCart }
			/>
		);

		expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 2 );

		const input = screen.getByRole( 'spinbutton' );
		await user.clear( input );
		await user.type( input, '5' );

		expect( onUpdateCartItemCount ).toHaveBeenLastCalledWith( product, 5 );

		await user.click( screen.getByRole( 'button', { name: 'Remove from cart' } ) );

		expect( onRemoveFromCart ).toHaveBeenCalledWith( product );
	} );

	it( 'adds via a card-body click when nothing is in the cart', async () => {
		const user = userEvent.setup();
		const onAddToCart = jest.fn();
		renderCard(
			<ProductCard { ...baseProps } asReferral={ false } count={ 0 } onAddToCart={ onAddToCart } />
		);

		await user.click( screen.getByText( 'A product description' ) );

		expect( onAddToCart ).toHaveBeenCalledWith( product, 1 );
	} );

	it( 'does nothing on a card-body click once the product is in the cart', async () => {
		const user = userEvent.setup();
		const onAddToCart = jest.fn();
		const onRemoveFromCart = jest.fn();
		renderCard(
			<ProductCard
				{ ...baseProps }
				asReferral={ false }
				count={ 2 }
				onAddToCart={ onAddToCart }
				onRemoveFromCart={ onRemoveFromCart }
			/>
		);

		await user.click( screen.getByText( 'A product description' ) );

		expect( onAddToCart ).not.toHaveBeenCalled();
		expect( onRemoveFromCart ).not.toHaveBeenCalled();
	} );
} );

describe( 'ProductCard in referral mode', () => {
	it( 'renders no stepper and toggles selection on the whole card', async () => {
		const user = userEvent.setup();
		const onSelectProduct = jest.fn();
		renderCard(
			<ProductCard { ...baseProps } asReferral count={ 0 } onSelectProduct={ onSelectProduct } />
		);

		expect( screen.queryByRole( 'spinbutton' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add to referral' } ) ).toBeVisible();

		await user.click( screen.getByText( 'A product description' ) );

		expect( onSelectProduct ).toHaveBeenCalledWith( product );
	} );
} );

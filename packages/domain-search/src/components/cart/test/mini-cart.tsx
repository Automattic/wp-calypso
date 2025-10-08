import { useMutation } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { TestDomainSearchWithCart } from '../../../test-helpers/renderer';
import { MiniCart } from '../mini-cart';

const MockMutation = ( { mutationPromise }: { mutationPromise: Promise< unknown > } ) => {
	const { mutate } = useMutation( {
		mutationFn: async () => {
			await mutationPromise;
			return Promise.resolve();
		},
	} );

	return <button onClick={ () => mutate() }>Click me</button>;
};

describe( 'MiniCart', () => {
	it( 'renders the domain count and total price', () => {
		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( { salePrice: '$90' } ),
					buildCartItem( { salePrice: undefined, price: '$10' } ),
				] }
			>
				<MiniCart />
			</TestDomainSearchWithCart>
		);

		expect(
			screen.getByLabelText( '2 domains selected. $100 total price. Click to view the cart' )
		).toBeInTheDocument();
	} );

	it( 'calls onContinue when the continue button is clicked', async () => {
		const fireEvent = userEvent.setup();
		const onContinue = jest.fn();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] } events={ { onContinue } }>
				<MiniCart />
			</TestDomainSearchWithCart>
		);

		await fireEvent.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalled();
	} );

	it( 'disables the continue button when there is a mutation in progress', async () => {
		const fireEvent = userEvent.setup();

		const mutation = Promise.withResolvers< void >();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<MockMutation mutationPromise={ mutation.promise } />
				<MiniCart />
			</TestDomainSearchWithCart>
		);

		await fireEvent.click( await screen.findByRole( 'button', { name: 'Click me' } ) );

		expect( await screen.findByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();

		mutation.resolve();
	} );
} );

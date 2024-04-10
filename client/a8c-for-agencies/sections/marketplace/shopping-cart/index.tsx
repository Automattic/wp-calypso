import page from '@automattic/calypso-router';
import { Badge, Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useState } from 'react';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import usePaymentMethod from '../../purchases/payment-methods/hooks/use-payment-method';
import ShoppingCartIcon from './shopping-cart-icon';
import ShoppingCartMenu from './shopping-cart-menu';
import type { ShoppingCartItem } from '../types';

import './style.scss';

type Props = {
	onCheckout: () => void;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
	items: ShoppingCartItem[];
};

export const CART_URL_HASH_FRAGMENT = '#cart';

export default function ShoppingCart( { onCheckout, onRemoveItem, items }: Props ) {
	const [ showShoppingCart, setShowShoppingCart ] = useState(
		window.location.hash === CART_URL_HASH_FRAGMENT
	);

	const { paymentMethodRequired } = usePaymentMethod();

	const toggleShoppingCart = () => {
		setShowShoppingCart( ( prevState ) => {
			const nextState = ! prevState;

			const hashFragment = nextState ? CART_URL_HASH_FRAGMENT : '';

			window.history.replaceState(
				null,
				'',
				window.location.pathname + window.location.search + hashFragment
			);

			return nextState;
		} );
	};

	const handleOnCheckout = () => {
		if ( paymentMethodRequired ) {
			page( `${ A4A_PAYMENT_METHODS_ADD_LINK }?return=${ A4A_MARKETPLACE_CHECKOUT_LINK }` );
			return;
		}
		onCheckout();
	};

	return (
		<div className="shopping-cart">
			<Button className="shopping-cart__button" onClick={ toggleShoppingCart } borderless>
				<Icon className="shopping-cart__button-icon" icon={ <ShoppingCartIcon /> } />

				<Badge
					className={ classNames( 'shopping-cart__button-badge', {
						'is-hidden': ! items.length,
					} ) }
					type="error"
				>
					{ items.length }
				</Badge>
			</Button>

			{ showShoppingCart && (
				<ShoppingCartMenu
					onClose={ () => {
						setShowShoppingCart( false );
						window.history.replaceState(
							null,
							'',
							window.location.pathname + window.location.search
						);
					} }
					items={ items }
					onCheckout={ handleOnCheckout }
					onRemoveItem={ onRemoveItem }
				/>
			) }
		</div>
	);
}

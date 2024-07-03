import page from '@automattic/calypso-router';
import { Badge, Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useContext } from 'react';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import usePaymentMethod from '../../purchases/payment-methods/hooks/use-payment-method';
import { MarketplaceTypeContext } from '../context';
import { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import ShoppingCartIcon from './shopping-cart-icon';
import ShoppingCartMenu from './shopping-cart-menu';
import type { ShoppingCartItem } from '../types';

import './style.scss';

type Props = {
	onCheckout: () => void;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
	items: ShoppingCartItem[];
	showCart: boolean;
	setShowCart: ( state: boolean ) => void;
	toggleCart: () => void;
};

export const CART_URL_HASH_FRAGMENT = '#cart';

export default function ShoppingCart( {
	onCheckout,
	onRemoveItem,
	items,
	showCart,
	setShowCart,
	toggleCart,
}: Props ) {
	const { paymentMethodRequired } = usePaymentMethod();

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isAutomatedReferrals = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	const handleOnCheckout = () => {
		if ( paymentMethodRequired && ! isAutomatedReferrals ) {
			page( `${ A4A_PAYMENT_METHODS_ADD_LINK }?return=${ A4A_MARKETPLACE_CHECKOUT_LINK }` );
			return;
		}
		onCheckout();
	};

	return (
		<div className="shopping-cart">
			<Button className="shopping-cart__button" onClick={ toggleCart } borderless>
				<Icon className="shopping-cart__button-icon" icon={ <ShoppingCartIcon /> } />

				<Badge
					className={ clsx( 'shopping-cart__button-badge', {
						'is-hidden': ! items.length,
					} ) }
					type="error"
				>
					{ items.length }
				</Badge>
			</Button>

			{ showCart && (
				<ShoppingCartMenu
					onClose={ () => {
						setShowCart( false );
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

import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useState } from 'react';
import { ShoppingCartItem } from '../types';
import ShoppingCartIcon from './shopping-cart-icon';
import ShoppingCartMenu from './shopping-cart-menu';

import './style.scss';

type Props = {
	onCheckout: () => void;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
	items: ShoppingCartItem[];
};

export default function ShoppingCart( { onCheckout, onRemoveItem, items }: Props ) {
	const [ showShoppingCart, setShowShoppingCart ] = useState( false );

	const toggleShoppingCart = () => {
		setShowShoppingCart( ( prevState ) => ! prevState );
	};

	return (
		<div className="shopping-cart">
			<Button className="shopping-cart__button" onClick={ toggleShoppingCart }>
				<Icon className="shopping-cart__button-icon" icon={ <ShoppingCartIcon /> } />

				<Badge
					className={ classNames( 'shopping-cart__button-badge', { 'is-hidden': ! items.length } ) }
					type="error"
				>
					{ items.length }
				</Badge>
			</Button>

			{ showShoppingCart && (
				<ShoppingCartMenu
					onClose={ () => setShowShoppingCart( false ) }
					items={ items }
					onCheckout={ onCheckout }
					onRemoveItem={ onRemoveItem }
				/>
			) }
		</div>
	);
}

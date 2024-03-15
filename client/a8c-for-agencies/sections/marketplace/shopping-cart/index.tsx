import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useState } from 'react';
import { SelectedLicenseProp as SelectedItem } from '../issue-license/types';
import ShoppingCartIcon from './shopping-cart-icon';
import ShoppingCartMenu from './shopping-cart-menu';

type Props = {
	onCheckout: () => void;
	onRemoveItem: ( item: SelectedItem ) => void;
	items: SelectedItem[];
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

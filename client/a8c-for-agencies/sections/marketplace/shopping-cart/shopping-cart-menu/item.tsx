import { formatCurrency } from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getProductPricingInfo } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import type { ShoppingCartItem } from '../../types';

type ItemProps = {
	item: ShoppingCartItem;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
};

export default function ShoppingCartMenuItem( { item, onRemoveItem }: ItemProps ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );

	const { actualCost, discountedCost } = getProductPricingInfo( userProducts, item, item.quantity );

	return (
		<li className="shopping-cart__menu-list-item">
			<Icon className="shopping-cart__menu-list-item-icon" icon={ check } />
			<div className="shopping-cart__menu-list-item-details">
				<div className="shopping-cart__menu-list-item-title">
					{ item.quantity > 1
						? translate( '%(productName)s x %(quantity)s', {
								args: { productName: item.name, quantity: item.quantity },
						  } )
						: item.name }
				</div>
				<div className="shopping-cart__menu-list-item-price">
					<span className="shopping-cart__menu-list-item-price-discounted">
						{ formatCurrency( discountedCost, item.currency ) }
					</span>
					{ actualCost !== discountedCost && (
						<span className="shopping-cart__menu-list-item-price-actual">
							{ formatCurrency( actualCost, item.currency ) }
						</span>
					) }
				</div>
			</div>
			<Button
				className="shopping-cart__menu-item-remove-button"
				variant="link"
				onClick={ () => onRemoveItem( item ) }
			>
				{ translate( 'Remove' ) }
			</Button>
		</li>
	);
}

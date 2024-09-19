import { formatCurrency } from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { useGetProductPricingInfo } from '../../wpcom-overview/hooks/use-total-invoice-value';
import type { ShoppingCartItem } from '../../types';

import './style.scss';

type ItemProps = {
	item: ShoppingCartItem;
	onRemoveItem?: ( item: ShoppingCartItem ) => void;
};

export default function ShoppingCartMenuItem( { item, onRemoveItem }: ItemProps ) {
	const translate = useTranslate();
	const userProducts = useSelector( getProductsList );

	const { getProductPricingInfo } = useGetProductPricingInfo();
	const { actualCost, discountedCost } = getProductPricingInfo( userProducts, item, item.quantity );
	// TODO: We are removing Creator's product name in the frontend because we want to leave it in the backend for the time being,
	//       We have to refactor this once we have updates. Context: p1714663834375719-slack-C06JY8QL0TU
	const productDisplayName =
		item.slug === 'wpcom-hosting-business' ? translate( 'WordPress.com Site' ) : item.name;
	const itemDisplayName =
		item.quantity > 1
			? translate( '%(productName)s x %(quantity)s', {
					args: { productName: productDisplayName, quantity: item.quantity },
			  } )
			: productDisplayName;
	const isFree = actualCost === 0;

	return (
		<li className="shopping-cart__menu-list-item">
			<Icon className="shopping-cart__menu-list-item-icon" icon={ check } />
			<div className="shopping-cart__menu-list-item-details">
				<div className="shopping-cart__menu-list-item-title">{ itemDisplayName }</div>
				<div className="shopping-cart__menu-list-item-price">
					{ isFree ? (
						translate( 'Free' )
					) : (
						<>
							<span className="shopping-cart__menu-list-item-price-discounted">
								{ formatCurrency( discountedCost, item.currency ) }
							</span>
							{ actualCost > discountedCost && (
								<span className="shopping-cart__menu-list-item-price-actual">
									{ formatCurrency( actualCost, item.currency ) }
								</span>
							) }
							<span>
								{ translate( '/mo', {
									comment: 'Abbreviation for per month',
								} ) }
							</span>
						</>
					) }
				</div>
			</div>
			{ onRemoveItem && (
				<Button
					className="shopping-cart__menu-item-remove-button"
					variant="link"
					onClick={ () => onRemoveItem( item ) }
				>
					{ translate( 'Remove' ) }
				</Button>
			) }
		</li>
	);
}

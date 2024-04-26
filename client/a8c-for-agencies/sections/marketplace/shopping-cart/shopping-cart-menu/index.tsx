import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Popover } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getTotalInvoiceValue } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import ShoppingCartMenuItem from './item';
import type { ShoppingCartItem } from '../../types';

import './style.scss';

type Props = {
	onClose: () => void;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
	onCheckout: () => void;
	items: ShoppingCartItem[];
};

export default function ShoppingCartMenu( { onClose, onCheckout, onRemoveItem, items }: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );
	const { discountedCost } = getTotalInvoiceValue( userProducts, items );

	return (
		<Popover
			isVisible={ true }
			onClose={ onClose }
			noArrow={ false }
			offset={ 24 }
			expandOnMobile
			headerTitle={ translate( 'Your cart' ) }
		>
			<div className="shopping-cart__menu">
				<div className="shopping-cart__menu-header">
					<h2 className="shopping-cart__menu-header-title">{ translate( 'Your cart' ) }</h2>

					<Button
						className="shopping-cart__menu-header-close-button"
						onClick={ onClose }
						borderless
					>
						<Icon icon={ close } size={ 24 } />
					</Button>
				</div>

				<ul className="shopping-cart__menu-list">
					{ items.map( ( item ) => (
						<ShoppingCartMenuItem
							key={ `shopping-cart-item-${ item.product_id }-${ item.quantity }` }
							item={ item }
							onRemoveItem={ onRemoveItem }
						/>
					) ) }
				</ul>

				<div className="shopping-cart__menu-footer">
					<div className="shopping-cart__menu-total">
						<span>{ translate( 'Total:' ) }</span>
						<span>
							{ translate( '%(total)s/mo', {
								args: { total: formatCurrency( discountedCost, items[ 0 ]?.currency ?? 'USD' ) },
							} ) }
						</span>
					</div>

					<Button
						className="shopping-cart__menu-checkout-button"
						onClick={ onCheckout }
						disabled={ ! items.length }
						primary
					>
						{ translate( 'Checkout' ) }
					</Button>
				</div>
			</div>
		</Popover>
	);
}

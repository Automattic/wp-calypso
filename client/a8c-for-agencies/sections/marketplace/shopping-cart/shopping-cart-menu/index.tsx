import { Button } from '@automattic/components';
import { Popover } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import CommissionsInfo from '../../commissions-info';
import { MarketplaceTypeContext, TermPricingContext } from '../../context';
import { useTotalInvoiceValue } from '../../hooks/use-marketplace';
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

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const { termPricing } = useContext( TermPricingContext );

	const userProducts = useSelector( getProductsList );
	const { getTotalInvoiceValue } = useTotalInvoiceValue(
		termPricing,
		items[ 0 ]?.currency ?? 'USD'
	);
	const { totalDiscountedCostFormattedText } = getTotalInvoiceValue( userProducts, items );

	return (
		<Popover
			isVisible
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
							termPricing={ termPricing }
						/>
					) ) }
				</ul>

				<div className="shopping-cart__menu-footer">
					<div className="shopping-cart__menu-total">
						<span>
							{ marketplaceType === 'regular'
								? translate( 'Total:' )
								: translate( 'Total your client will pay:' ) }
						</span>

						<span>{ totalDiscountedCostFormattedText }</span>
					</div>

					{ marketplaceType === 'referral' && (
						<CommissionsInfo items={ items } termPricing={ termPricing } />
					) }

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

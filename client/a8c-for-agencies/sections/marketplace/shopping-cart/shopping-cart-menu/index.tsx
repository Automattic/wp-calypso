import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Popover } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { useTotalInvoiceValue } from '../../wpcom-overview/hooks/use-total-invoice-value';
import ShoppingCartMenuItem from './item';
import type { MarketplaceType, ShoppingCartItem } from '../../types';

import './style.scss';

type Props = {
	onClose: () => void;
	onRemoveItem: ( item: ShoppingCartItem ) => void;
	onCheckout: () => void;
	items: ShoppingCartItem[];
	marketplaceType?: MarketplaceType;
};

export default function ShoppingCartMenu( {
	onClose,
	onCheckout,
	onRemoveItem,
	items,
	marketplaceType = 'regular',
}: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );
	const { getTotalInvoiceValue } = useTotalInvoiceValue();
	const { discountedCost } = getTotalInvoiceValue( userProducts, items );
	// FIXME: we should update the magic numbers here with values when backend part is finished.
	const commissionAmount = Math.floor( discountedCost * 0.5 );

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
						<span>
							{ translate( '%(total)s/mo', {
								args: { total: formatCurrency( discountedCost, items[ 0 ]?.currency ?? 'USD' ) },
							} ) }
						</span>
					</div>
					{ marketplaceType === 'referral' && (
						<div className="shopping-cart__menu-commission">
							<span>{ translate( 'Your estimated commision:' ) }</span>
							<span>
								{ translate( '%(total)s/mo', {
									args: {
										total: formatCurrency( commissionAmount, items[ 0 ]?.currency ?? 'USD' ),
									},
								} ) }
							</span>
						</div>
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

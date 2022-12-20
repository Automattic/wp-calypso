import { useTranslate } from 'i18n-calypso';
import './EmptyCart.scss';

const EmptyCart: React.FC = () => {
	const translate = useTranslate();
	return (
		<div className="jetpack-cloud-cart__empty">
			<div className="jetpack-cloud-cart__empty-title">{ translate( 'Your cart is empty' ) }</div>
			<div className="jetpack-cloud-cart__empty-info">
				{ translate( 'Add one or more products to your cart and checkout in one step.' ) }
			</div>
		</div>
	);
};

export default EmptyCart;

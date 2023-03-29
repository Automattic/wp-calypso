import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import PrePurchaseNotice from './prepurchase-notice';

import './style.scss';

type Props = {
	overlapingProductSlug: string;
	cartProductSlug: string;
};

const AkismetProductOverlapsOwnedProductNotice: FunctionComponent< Props > = ( {
	overlapingProductSlug,
	cartProductSlug,
} ) => {
	const translate = useTranslate();
	const products = useSelector( ( state ) => ( {
		overlaping: getProductBySlug( state, overlapingProductSlug ),
		cart: getProductBySlug( state, cartProductSlug ),
	} ) );
	const purchases = useSelector( getUserPurchases );
	const purchase = Array.isArray( purchases )
		? purchases.find( ( p ) => p.productSlug === products.overlaping?.product_slug )
		: null;
	const purchaseId = purchase?.id;
	const subscriptionUrl = purchaseId
		? `/me/purchases/siteless.akismet.com/${ purchaseId }`
		: '/me/purchases/';

	const message = translate(
		'You current own {{oldProduct/}}. The plan you are about to purchase {{newProduct/}} contains all the same functionality and benefits of your current plan. Consider {{link}}removing your {{oldProduct/}} subscription{{/link}} to avoid paying for both plans.',
		{
			comment:
				'The `oldProduct` variable refers to the product the customer owns already. The `newProduct` variable refers to the product they are about to purchase.',
			components: {
				link: <a href={ subscriptionUrl } />,
				oldProduct: <>{ products.overlaping?.product_name }</>,
				newProduct: <>{ products.cart?.product_name }</>,
			},
		}
	);

	return (
		<PrePurchaseNotice
			message={ message }
			linkUrl={ subscriptionUrl }
			linkText={ translate( 'Manage subscription' ) }
		/>
	);
};

export default AkismetProductOverlapsOwnedProductNotice;

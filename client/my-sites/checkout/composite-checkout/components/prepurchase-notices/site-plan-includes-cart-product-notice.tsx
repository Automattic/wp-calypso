import { getJetpackProductDisplayName } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import PrePurchaseNotice from './prepurchase-notice';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import type { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	plan: SitePlan;
	product: ResponseCartProduct;
	selectedSite: Site;
};

const SitePlanIncludesCartProductNotice: FunctionComponent< Props > = ( {
	plan,
	product,
	selectedSite,
} ) => {
	const translate = useTranslate();
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const purchase = Array.isArray( purchases )
		? purchases.find( ( p ) => p.productSlug === plan.product_slug )
		: null;
	const purchaseId = purchase?.id;
	const subscriptionUrl = purchaseId
		? `/me/purchases/${ selectedSite.slug }/${ purchaseId }`
		: '/me/purchases/';

	const message = translate(
		'You currently own Jetpack %(plan)s. The product you are about to purchase, {{product/}}, is already included in this plan.',
		{
			args: {
				plan: plan.product_name_short,
			},
			components: {
				product: <>{ getJetpackProductDisplayName( product ) }</>,
			},
			comment:
				'The `plan` variable refers to the short name of the plan the customer owns already. `product` refers to the product in the cart that is already included in the plan.',
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

export default SitePlanIncludesCartProductNotice;

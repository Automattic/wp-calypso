import { sitePurchasesQuery } from '@automattic/api-queries';
import { getJetpackProductDisplayName } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import PrePurchaseNotice from './prepurchase-notice';
import type { Site as ApiSite } from '@automattic/api-core';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

type Site = {
	ID: number;
	slug: string;
};

type Props = {
	plan: NonNullable< ApiSite[ 'plan' ] >;
	product: ResponseCartProduct;
	selectedSite: Site;
};

const SitePlanIncludesCartProductNotice: FunctionComponent< Props > = ( {
	plan,
	product,
	selectedSite,
} ) => {
	const translate = useTranslate();
	const { data: purchaseId } = useQuery( {
		...sitePurchasesQuery( selectedSite.ID ),
		select: ( purchases ) => purchases.find( ( p ) => p.product_slug === plan.product_slug )?.ID,
	} );
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

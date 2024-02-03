import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import PrePurchaseNotice from './prepurchase-notice';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import type { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';

type Props = {
	sitePlan: SitePlan;
	cartProduct: ResponseCartProduct;
};

const SitePlanIsLegacyBundleUpgrade: FunctionComponent< Props > = ( { sitePlan, cartProduct } ) => {
	const translate = useTranslate();
	const supportUrl = localizeUrl( 'https://jetpack.com/contact-support/' );
	const message = translate(
		'The %(product)s plan will replace your %(existingPlan)s plan. %(product)s is packed with additional features, but does have a lower backup storage capacity. Please contact support for a free storage upgrade for one year.',
		{
			args: {
				existingPlan: sitePlan.product_name_short,
				product: cartProduct.product_name,
			},
			comment:
				'The `plan` variable refers to the short name of the plan the customer owns already. `product` refers to the product in the cart that is an upgrade.',
		}
	);

	return (
		<PrePurchaseNotice
			message={ message }
			linkUrl={ supportUrl }
			linkText={ translate( 'Contact Support' ) }
		/>
	);
};

export default SitePlanIsLegacyBundleUpgrade;

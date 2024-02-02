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
		'The %(product)s plan you are purchasing will replace your existing %(existingPlan)s plan. The new %(product)s plan has a lower storage limit and shorter retention policy - some of your older backups maybe deleted after the upgrade. Please contact support about a free storage upgrade for one year.',
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

import { useTranslate } from 'i18n-calypso';
import type { FunctionComponent } from 'react';
import type { Purchase } from 'calypso/lib/purchases/types';
import PrePurchaseNotice from './prepurchase-notice';

import './style.scss';

type Props = {
	purchase: Purchase;
};

const AkismetProductOverlapsOwnedProductNotice: FunctionComponent< Props > = ( { purchase } ) => {
	const translate = useTranslate();
	const subscriptionUrl = `/me/purchases/siteless.akismet.com/${ purchase.id }`;

	const message = translate(
		'The plan you are about to purchase contains all the same features of your current plan. Consider {{link}}removing your %(product)s subscription{{/link}} to avoid paying for both plans.',
		{
			comment: 'The `product` variable refers to the product the customer owns already.',
			components: {
				link: <a href={ subscriptionUrl } />,
			},
			args: {
				product: purchase.productName,
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

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import type { ReceiptPurchase } from './receipt';
import type { FunctionComponent } from 'react';

interface StudioThankYouProps {
	purchases: ReceiptPurchase[];
}

/**
 * The thank-you page for a purchase made through the Studio checkout.
 *
 * It links to neither the desktop app nor the web: a buyer may not have the app, and Studio has
 * no web app yet. `StudioHandoff` hands a buyer who came from the app back to it.
 */
const StudioThankYou: FunctionComponent< StudioThankYouProps > = ( { purchases } ) => {
	const translate = useTranslate();
	const productName = purchases[ 0 ]?.productName;

	return (
		<ThankYouV2
			title={ translate( 'Thank you for your purchase' ) }
			subtitle={
				productName
					? translate( '%(productName)s is ready to use in WordPress Studio.', {
							args: { productName },
							comment: '%(productName)s is the name of the product that was just purchased.',
						} )
					: translate( 'Your purchase is ready to use in WordPress Studio.' )
			}
			products={
				purchases.length
					? purchases.map( ( purchase ) => (
							<ThankYouProduct
								key={ purchase.productSlug }
								name={ purchase.productName }
								icon={ studioAppLogo }
								actions={
									<Button href={ purchasesRoot }>{ translate( 'Manage purchase' ) }</Button>
								}
							/>
						) )
					: undefined
			}
		/>
	);
};

export default StudioThankYou;

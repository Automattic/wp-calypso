import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { STUDIO_WEB_APP_URL } from 'calypso/lib/studio/checkout-urls';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { openStudioApp } from '../studio-return/deep-link';
import { useStudioCheckoutReturn } from './studio-handoff';
import type { ReceiptPurchase } from './receipt';
import type { FunctionComponent } from 'react';

interface StudioThankYouProps {
	purchases: ReceiptPurchase[];
	receiptId?: number;
}

/**
 * The thank-you page for a purchase made through the Studio checkout.
 */
const StudioThankYou: FunctionComponent< StudioThankYouProps > = ( { purchases, receiptId } ) => {
	const translate = useTranslate();

	const { studioCheckoutParams, openStudio: openStudioCheckoutReturn } = useStudioCheckoutReturn( {
		receiptId,
	} );
	const productName = purchases[ 0 ]?.productName;

	const openStudio = () => {
		if ( studioCheckoutParams ) {
			openStudioCheckoutReturn( { fromUserClick: true } );
			return;
		}
		recordTracksEvent( 'calypso_studio_checkout_open_app_click' );
		openStudioApp();
	};

	// Without Studio's round-trip params, the desktop app may not be installed, and Safari answers
	// an unhandled `wp-studio://` with an "invalid address" alert, so the web app goes first.
	const desktopAppButton = (
		<Button primary={ !! studioCheckoutParams } onClick={ openStudio }>
			{ translate( 'Open the WordPress Studio app' ) }
		</Button>
	);
	const webAppButton = (
		<Button primary={ ! studioCheckoutParams } href={ STUDIO_WEB_APP_URL }>
			{ translate( 'Open WordPress Studio on the web' ) }
		</Button>
	);

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
			headerButtons={
				studioCheckoutParams ? (
					<>
						{ desktopAppButton }
						{ webAppButton }
					</>
				) : (
					<>
						{ webAppButton }
						{ desktopAppButton }
					</>
				)
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

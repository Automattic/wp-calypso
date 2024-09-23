import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySites from 'calypso/components/data/query-sites';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import useGetJetpackActivationConfirmationInfo from './use-get-jetpack-activation-confirmation-info';

interface Props {
	productSlug: string;
	destinationSiteId: number;
	redirectTo?: string;
}

const LicensingActivationThankYouCompleted: FC< Props > = ( {
	productSlug = 'no_product',
	destinationSiteId = 0,
	redirectTo,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( getIsProductListFetching );

	// In the siteless-checkout flow, the subscription is transferred from temporary-site to the user's target site.
	const subscriptionTransferSucceeded = destinationSiteId > 0;

	const title = useMemo( () => {
		return subscriptionTransferSucceeded
			? translate( `Your %(productName)s is active! %(celebrationEmoji)s`, {
					args: {
						productName: hasProductInfo ? ( productName as string ) : 'subscription',
						celebrationEmoji: String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */,
					},
			  } )
			: translate( 'Your subscription will be activated soon' );
	}, [ subscriptionTransferSucceeded, translate, productName, hasProductInfo ] );

	const productConfirmationInfo = useGetJetpackActivationConfirmationInfo(
		destinationSiteId,
		productSlug
	);

	return (
		<>
			{ subscriptionTransferSucceeded && <QuerySites siteId={ destinationSiteId } /> }
			{ hasProductInfo && <QueryProducts type="jetpack" /> }
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-auto-activate-completed/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Auto Activation Completed"
			/>
			<LicensingActivation
				title={ title }
				footerImage={ productConfirmationInfo.image }
				isLoading={ isProductListFetching }
				showContactUs
				showProgressIndicator
				progressIndicatorValue={ 3 }
				progressIndicatorTotal={ 3 }
			>
				{ ! subscriptionTransferSucceeded && (
					<p>
						{ productName &&
							translate(
								'As soon as your %(productName)s subscription is activated you will receive a confirmation email from our Happiness Engineers.',
								{
									args: { productName },
								}
							) }
						{ ! productName &&
							translate(
								'As soon as your subscription is activated you will receive a confirmation email from our Happiness Engineers.'
							) }
					</p>
				) }
				{ subscriptionTransferSucceeded && (
					<>
						<p>{ productConfirmationInfo.text }</p>

						<Button
							primary
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_siteless_checkout_site_confirmed_clicked', {
										product_slug: productSlug,
									} )
								)
							}
							// TODO: Need to ensure redirectTo is either wp.com or wp admin of the site.
							href={ redirectTo ?? productConfirmationInfo.buttonUrl }
						>
							{ translate( 'Go to Dashboard' ) }
						</Button>
					</>
				) }
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationThankYouCompleted;

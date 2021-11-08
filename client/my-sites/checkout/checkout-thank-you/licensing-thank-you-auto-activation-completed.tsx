import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySites from 'calypso/components/data/query-sites';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import getJetpackCheckoutSupportTicketDestinationSiteId from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-destination-site-id';
import useGetJetpackActivationConfirmationInfo from './use-get-jetpack-activation-confirmation-info';

interface Props {
	productSlug: string;
	receiptId?: number;
	jetpackTemporarySiteId?: number;
}

const LicensingActivationThankYouCompleted: FC< Props > = ( {
	productSlug = 'no_product',
	jetpackTemporarySiteId = 0,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( ( state ) => getIsProductListFetching( state ) );

	const destinationSiteId = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketDestinationSiteId( state, jetpackTemporarySiteId )
	);
	const automaticTransferSucceeded = destinationSiteId > 0;

	const title = useMemo( () => {
		return automaticTransferSucceeded
			? translate( `Your %(productName)s is active! %(celebrationEmoji)s`, {
					args: {
						productName: hasProductInfo ? productName : 'subscription',
						celebrationEmoji: String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */,
					},
			  } )
			: translate( 'Your subscription will be activated soon' );
	}, [ automaticTransferSucceeded, translate, productName, hasProductInfo ] );

	const productConfirmationInfo = useGetJetpackActivationConfirmationInfo(
		destinationSiteId,
		productSlug
	);

	return (
		<>
			{ automaticTransferSucceeded && <QuerySites siteId={ destinationSiteId } /> }
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
			>
				{ ! automaticTransferSucceeded && (
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
				{ automaticTransferSucceeded && (
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
							href={ productConfirmationInfo.buttonUrl }
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

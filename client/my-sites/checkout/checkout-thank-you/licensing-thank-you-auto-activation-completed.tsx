import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import successImageAntiSpam from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
import successImageComplete from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
import successImageDefault from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
import successImageScan from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
import successImageSearch from 'calypso/assets/images/jetpack/licensing-activation-success-Default.png';
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
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import { getActivationCompletedLink } from './utils';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
	jetpackTemporarySiteId?: number;
}

type RawSite = {
	name: string;
};

const LicensingActivationThankYouCompleted: FC< Props > = ( {
	productSlug,
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
	const rawSite = useSelector( ( state ) => getRawSite( state, destinationSiteId ) as RawSite );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, destinationSiteId ) );
	const wpAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, destinationSiteId ) );
	const siteConfirmedLink = getActivationCompletedLink( productSlug, siteSlug, wpAdminUrl );

	const title = useMemo( () => {
		return automaticTransferSucceeded
			? translate( 'Your %(productName)s is active!', {
					args: { productName },
			  } )
			: translate( 'Your subscription will be activated soon' );
	}, [ automaticTransferSucceeded, translate, productName ] );

	return (
		<>
			{ automaticTransferSucceeded && <QuerySites siteId={ destinationSiteId } /> }
			{ productSlug && <QueryProducts type="jetpack" /> }
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-auto-activate-completed/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Auto Activation Completed"
			/>
			<LicensingActivation
				title={ title }
				footerImage={ successImageDefault }
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
						<p>
							{ productName &&
								rawSite?.name &&
								translate( 'Your %(productName)s is active on {{strong}}%(siteName)s{{/strong}}!', {
									args: { productName, siteName: rawSite.name },
									components: {
										strong: (
											<strong className="licensing-thank-you-auto-activation-completed__site-name" />
										),
									},
								} ) }
							{ productName &&
								! rawSite &&
								translate( 'Your %(productName)s is active', {
									args: { productName },
								} ) }
							{ ! productName && translate( 'We successfully activated your subscription.' ) }
						</p>

						<Button
							primary
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_siteless_checkout_site_confirmed_clicked', {
										product_slug: productSlug,
									} )
								)
							}
							href={ siteConfirmedLink }
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

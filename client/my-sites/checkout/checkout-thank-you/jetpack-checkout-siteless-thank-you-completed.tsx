import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySites from 'calypso/components/data/query-sites';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
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

import './style.scss';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
	jetpackTemporarySiteId?: number;
}

const JetpackCheckoutSitelessThankYouCompleted: FC< Props > = ( {
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
	const rawSite = useSelector( ( state ) => getRawSite( state, destinationSiteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, destinationSiteId ) );
	const wpAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, destinationSiteId ) );
	const siteConfirmedLink = getActivationCompletedLink( productSlug, siteSlug, wpAdminUrl );

	const title = useMemo( () => {
		return automaticTransferSucceeded
			? translate( 'Your subscription has been activated and is ready to go!' )
			: translate( 'Your subscription will be activated soon' );
	}, [ automaticTransferSucceeded, translate ] );

	return (
		<Main wideLayout className="jetpack-checkout-siteless-thank-you-completed">
			{ automaticTransferSucceeded && <QuerySites siteId={ destinationSiteId } /> }
			{ productSlug && <QueryProducts type="jetpack" /> }
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you-completed/no-site/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Siteless Thank You Completed"
			/>
			<Card className="jetpack-checkout-siteless-thank-you-completed__card">
				<div className="jetpack-checkout-siteless-thank-you-completed__card-main">
					<JetpackLogo size={ 45 } />
					<h1
						className={
							isProductListFetching
								? 'jetpack-checkout-siteless-thank-you-completed__main-message-loading'
								: 'jetpack-checkout-siteless-thank-you-completed__main-message'
						}
					>
						{ title }
					</h1>
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
									translate(
										"We successfully activated %(productName)s on {{strong}}%(siteName)s{{/strong}}. Next, we'll recommend features based on your goals.",
										{
											args: { productName, siteName: rawSite.name },
											components: {
												strong: (
													<strong className="jetpack-checkout-siteless-thank-you-completed__site-name" />
												),
											},
										}
									) }
								{ productName &&
									! rawSite &&
									translate(
										"We successfully activated %(productName)s. Next, we'll recommend features based on your goals.",
										{
											args: { productName },
										}
									) }
								{ ! productName &&
									translate(
										"We successfully activated your subscription. Next, we'll recommend features based on your goals."
									) }
							</p>

							<Button
								className="jetpack-checkout-siteless-thank-you-completed__button"
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
								{ translate( "Let's go!" ) }
							</Button>
						</>
					) }
				</div>
			</Card>
		</Main>
	);
};

export default JetpackCheckoutSitelessThankYouCompleted;

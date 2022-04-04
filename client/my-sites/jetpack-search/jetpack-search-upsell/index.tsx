import { PRODUCT_JETPACK_SEARCH } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { getPurchaseURLCallback } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackSearchContent from '../content';
import JetpackSearchFooter from '../footer';
import JetpackSearchLogo from '../logo';

import './style.scss';

export default function JetpackSearchUpsell(): ReactElement {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_search_upsell' );
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const selectedSiteSlug = useSelector( getSelectedSiteSlug ) || '';
	const dispatch = useDispatch();
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const createProductURL = getPurchaseURLCallback( selectedSiteSlug, {} );

	const WPComUpgradeUrl =
		'https://jetpack.com/upgrade/search/?utm_campaign=my-sites-jetpack-search&utm_source=calypso&site=' +
		selectedSiteSlug;
	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_search_upsell' ) ),
		[ dispatch ]
	);

	return (
		<Main className="jetpack-search-upsell" wideLayout={ isJetpackCloud() }>
			<DocumentHead title="Jetpack Search" />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			{ isJetpackCloud() ? (
				<div className="jetpack-search-upsell__content">
					<QueryJetpackSaleCoupon />
					<QueryProductsList type="jetpack" />
					{ siteId && <QueryIntroOffers siteId={ siteId } /> }
					{ siteId && <QuerySiteProducts siteId={ siteId } /> }
					<UpsellProductCard
						productSlug={ PRODUCT_JETPACK_SEARCH }
						siteId={ siteId }
						currencyCode={ currencyCode }
						getButtonURL={ createProductURL }
						onCtaButtonClick={ onClick }
					/>
				</div>
			) : (
				<JetpackSearchContent
					headerText={ translate( 'Finely-tuned search for your site.' ) }
					bodyText={ translate(
						'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
					buttonLink={ WPComUpgradeUrl }
					buttonText={ translate( 'Upgrade to Jetpack Search' ) }
					onClick={ onUpgradeClick }
					iconComponent={ <JetpackSearchLogo /> }
				/>
			) }

			<JetpackSearchFooter />
		</Main>
	);
}

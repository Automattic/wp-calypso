import {
	FEATURE_TYPE_JETPACK_SEARCH,
	PLAN_BUSINESS,
	PRODUCT_JETPACK_SEARCH,
} from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search-new.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import FormattedHeader from 'calypso/components/formatted-header';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import UpsellProductWpcomPlanCard from 'calypso/components/jetpack/upsell-product-wpcom-plan-card';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackSearchFooter from '../footer';

import './style.scss';

export default function JetpackSearchUpsell() {
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_search_upsell' );
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const selectedSiteSlug = useSelector( getSelectedSiteSlug ) || '';
	const isAdmin = useSelector(
		( state ) => siteId && canCurrentUser( state, siteId, 'manage_options' )
	);
	const dispatch = useDispatch();
	const translate = useTranslate();

	const WPComUpgradeUrl =
		'https://jetpack.com/upgrade/search/?utm_campaign=my-sites-jetpack-search&utm_source=calypso&site=' +
		selectedSiteSlug;
	const postCheckoutUrl = window.location.pathname + window.location.search;
	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_search_upsell' ) ),
		[ dispatch ]
	);

	const isSimple = useSelector( isSimpleSite );

	return (
		<Main className="jetpack-search-upsell" wideLayout={ isJetpackCloud() }>
			<DocumentHead title="Jetpack Search" />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			{ isJetpackCloud() ? (
				<div className="jetpack-search-upsell__content">
					<QueryJetpackSaleCoupon />
					{ isSimple && <QueryProductsList /> }
					{ ! isSimple && <QueryProductsList type="jetpack" /> }
					{ siteId && <QueryIntroOffers siteId={ siteId } /> }
					{ siteId && <QuerySiteProducts siteId={ siteId } /> }
					{ isSimple && (
						<UpsellProductWpcomPlanCard
							WPcomPlanSlug={ PLAN_BUSINESS }
							nonManageProductSlug={ PRODUCT_JETPACK_SEARCH }
							siteId={ siteId }
							onCtaButtonClick={ onClick }
						/>
					) }
					{ ! isSimple && (
						<UpsellProductCard
							featureType={ FEATURE_TYPE_JETPACK_SEARCH }
							nonManageProductSlug={ PRODUCT_JETPACK_SEARCH }
							siteId={ siteId }
							onCtaButtonClick={ onClick }
						/>
					) }
				</div>
			) : (
				<>
					<FormattedHeader
						headerText={ translate( 'Jetpack Search' ) }
						id="jetpack-search-header"
						align="left"
						brandFont
					/>
					<PromoCard
						title={ translate( 'Finely-tuned search for your site.' ) }
						image={ { path: JetpackSearchSVG } }
						isPrimary
					>
						<p>
							{ translate(
								'Incredibly powerful and customizable, Jetpack Search helps your visitors ' +
									'instantly find the right content – right when they need it.'
							) }
						</p>

						{ ! isAdmin && (
							<Notice
								status="is-warning"
								text={ translate( 'Only site administrators can upgrade to Jetpack Search.' ) }
								showDismiss={ false }
							/>
						) }

						{ isAdmin && (
							<PromoCardCTA
								cta={ {
									text: translate( 'Upgrade to Jetpack Search' ),
									action: {
										url:
											siteId && selectedSiteSlug
												? addQueryArgs( `/checkout/${ selectedSiteSlug }/jetpack_search`, {
														redirect_to: postCheckoutUrl,
												  } )
												: WPComUpgradeUrl,
										onClick: onUpgradeClick,
										selfTarget: true,
									},
								} }
							/>
						) }
					</PromoCard>
				</>
			) }
			<JetpackSearchFooter />
		</Main>
	);
}

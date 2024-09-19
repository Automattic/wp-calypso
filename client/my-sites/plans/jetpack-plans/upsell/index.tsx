/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_ANTI_SPAM,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	getJetpackProductsDisplayNames,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon, Button, PlanPrice } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useCallback } from 'react';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { useExperiment } from 'calypso/lib/explat';
import { preventWidows } from 'calypso/lib/formatting';
import badge14Src from 'calypso/my-sites/checkout/src/components/assets/icons/badge-14.svg';
import { GUARANTEE_DAYS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PURCHASE_FLOW_UPSELLS_MATRIX } from '../constants';
import getViewTrackerPath from '../get-view-tracker-path';
import slugToSelectorProduct from '../slug-to-selector-product';
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

interface Props {
	rootUrl: string;
	siteSlug: string;
	productSlug: string;
	urlQueryArgs: QueryArgs;
}

const JetpackUpsellPage: React.FC< Props > = ( {
	rootUrl,
	siteSlug,
	productSlug,
	urlQueryArgs,
} ) => {
	const upsellSlug = PURCHASE_FLOW_UPSELLS_MATRIX[ productSlug ];
	const productNames = getJetpackProductsDisplayNames();

	const dispatch = useDispatch();
	const [ isLoadingUpsellPageExperiment, experimentAssignment ] = useExperiment(
		'calypso_jetpack_upsell_page_2022_06'
	);

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const isFetchingPurchases = useSelector( isFetchingSitePurchases );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const productItem = useMemo( () => slugToSelectorProduct( productSlug ), [ productSlug ] );
	const upsellItem = useMemo(
		() => ( upsellSlug ? slugToSelectorProduct( upsellSlug ) : null ),
		[ upsellSlug ]
	);
	const productCheckoutURL = useMemo(
		() => buildCheckoutURL( siteSlug, productSlug, urlQueryArgs ),
		[ siteSlug, productSlug, urlQueryArgs ]
	);
	const upsellCheckoutURL = useMemo(
		() => ( upsellSlug ? buildCheckoutURL( siteSlug, upsellSlug, urlQueryArgs ) : '' ),
		[ siteSlug, upsellSlug, urlQueryArgs ]
	);
	const isUpsellOwned = useMemo(
		() =>
			isFetchingPurchases ? false : !! purchases?.find( ( p ) => p.productSlug === upsellSlug ),
		[ upsellSlug, purchases, isFetchingPurchases ]
	);
	const { intro, description, cta, features } = useMemo( () => {
		if ( PLAN_JETPACK_SECURITY_T1_YEARLY === upsellSlug ) {
			return {
				intro: translate( 'Here’s a popular bundle for comprehensive site security:' ),
				description: translate( 'Save money with all Jetpack security products in one bundle:' ),
				cta: translate( 'Upgrade your site security for only an additional{{asterisk/}}:', {
					components: {
						asterisk: <sup>*</sup>,
					},
				} ),
				features: [
					{
						slug: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
						text: translate( 'Real-time cloud backups and one-click restores' ),
					},
					{
						slug: PRODUCT_JETPACK_SCAN,
						text: translate( 'Malware scanning and one-click fixes' ),
					},
					{
						slug: PRODUCT_JETPACK_ANTI_SPAM,
						text: translate( 'Block spam in comments and forms' ),
					},
				],
			};
		}

		return {};
	}, [ upsellSlug ] );

	const productName = productItem?.displayName;
	const upsellName = upsellItem?.displayName;

	const productPriceObj = useItemPrice( siteId, productItem );
	const upsellPriceObj = useItemPrice( siteId, upsellItem );
	const priceDelta =
		( upsellPriceObj?.discountedPrice || upsellPriceObj?.originalPrice ) -
		( productPriceObj?.discountedPrice || productPriceObj?.originalPrice );
	const isLoadingPrice = productPriceObj?.isFetching || upsellPriceObj?.isFetching;
	const showPrice = ! isLoadingPrice && priceDelta > 0;

	const viewTrackerPath = useMemo(
		() => getViewTrackerPath( rootUrl, siteSlug ),
		[ rootUrl, siteSlug ]
	);
	const onCtaClick = useCallback(
		( productSlug: string, isUpsell = false ) => {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_upsell_page_product_click', {
					site_id: siteId || undefined,
					product_slug: productSlug,
					path: viewTrackerPath,
					is_upsell: isUpsell,
				} )
			);
		},
		[ siteId, viewTrackerPath, dispatch ]
	);

	useEffect( () => {
		// Because .layout__content has padding, we need to make sure that this upsell page has
		// enough height available to display the color blobs without cropping them. This causes
		// the scroll bar to appear in Calypso blue. Here we make sure we see the top of the page.
		window.scrollTo( 0, 0 );
	}, [] );

	useEffect( () => {
		if ( ! isLoadingUpsellPageExperiment && experimentAssignment?.variationName !== 'treatment' ) {
			page.redirect( `${ rootUrl }/${ siteSlug }` );
		}

		if ( ( ! upsellSlug || isUpsellOwned ) && productCheckoutURL ) {
			page.redirect( productCheckoutURL );
		}
	}, [
		upsellSlug,
		isUpsellOwned,
		productCheckoutURL,
		isLoadingUpsellPageExperiment,
		experimentAssignment,
		rootUrl,
		siteSlug,
	] );

	if ( isLoadingUpsellPageExperiment || ! upsellSlug || isFetchingPurchases || isUpsellOwned ) {
		return null;
	}

	return (
		<>
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<QueryIntroOffers siteId={ siteId ?? 'none' } />

			<main className="jetpack-upsell">
				<div className="jetpack-upsell__blobs">
					<div className="jetpack-upsell__header">
						<h1 className="jetpack-upsell__heading">
							{ translate( 'Nice choice, we added %(productName)s to your cart.', {
								args: {
									productName: productName as string,
								},
							} ) }
							<br />
							{ intro }
						</h1>
					</div>

					<div className="jetpack-upsell__card">
						<div className="jetpack-upsell__card-header">
							<Gridicon icon="star" size={ 18 } aria-hidden />
							{ translate( 'Best value' ) }
						</div>
						<div className="jetpack-upsell__card-body">
							<h2 className="jetpack-upsell__product-name">{ upsellName }</h2>
							{ description && <p>{ description }</p> }
							{ features?.length && (
								<ul className="jetpack-upsell__features">
									{ features.map( ( { slug, text } ) => {
										const isProductSelected = slug === productSlug;

										return (
											<li className={ clsx( { 'is-selected': isProductSelected } ) } key={ slug }>
												<span className="jetpack-upsell__icon-ctn">
													<Gridicon
														icon={ isProductSelected ? 'checkmark' : 'plus' }
														size={ 18 }
														aria-hidden
													/>
												</span>
												<span className="jetpack-upsell__features-product">
													{ productNames[ slug ] || slug }
												</span>
												{ ' - ' }
												<span className="jetpack-upsell__features-desc">
													{ isProductSelected ? translate( 'Already in your cart' ) : text }
												</span>
											</li>
										);
									} ) }
								</ul>
							) }
							{ isLoadingPrice && (
								<div className="jetpack-upsell__price-skeleton">
									<div></div>
									<div></div>
								</div>
							) }
							{ showPrice && (
								<div className="jetpack-upsell__cost-info">
									{ cta && <p>{ cta }</p> }
									<div className="jetpack-upsell__price-ctn">
										<span className="jetpack-upsell__price-plus">+</span>
										<PlanPrice
											className="jetpack-upsell__price"
											rawPrice={ priceDelta }
											currencyCode={ currencyCode }
										/>
										<span className="jetpack-upsell__price-timeframe">
											{ translate( '/month, paid yearly' ) }
										</span>
									</div>
								</div>
							) }
							<div className="jetpack-upsell__actions">
								<Button
									className="jetpack-upsell__action-yes"
									href={ upsellCheckoutURL }
									onClick={ () => onCtaClick( upsellSlug, true ) }
									primary
								>
									{ translate( 'Upgrade to %(productName)s', {
										args: {
											productName: upsellName as string,
										},
									} ) }
								</Button>
								<a
									className="jetpack-upsell__action-no"
									href={ productCheckoutURL }
									onClick={ () => onCtaClick( productSlug ) }
								>
									{ translate( 'No thanks, proceed with %(productName)s', {
										args: {
											productName: productName as string,
										},
									} ) }
								</a>
							</div>
						</div>
					</div>

					<div className="jetpack-upsell__footer">
						<p className="jetpack-upsell__guarantee">
							{ 14 === GUARANTEE_DAYS && <img src={ badge14Src } alt="" /> }
							<span>
								{ preventWidows(
									translate( '%(days)d day money back guarantee.', {
										args: { days: GUARANTEE_DAYS },
									} )
								) }
							</span>
						</p>
						{ showPrice && (
							<p className="jetpack-upsell__note">
								<sup>*</sup>
								{ preventWidows(
									translate(
										'Discount is for the first year only, all renewals are at full price.'
									)
								) }
							</p>
						) }
					</div>
				</div>
			</main>
		</>
	);
};

export default JetpackUpsellPage;

import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_ANTI_SPAM,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	getJetpackProductsDisplayNames,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import Main from 'calypso/components/main';
import { useExperiment } from 'calypso/lib/explat';
import PlanPrice from 'calypso/my-sites/plan-price';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PURCHASE_FLOW_UPSELLS_MATRIX } from '../constants';
import slugToSelectorProduct from '../slug-to-selector-product';
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

interface Props {
	siteSlug: string;
	productSlug: string;
	urlQueryArgs: QueryArgs;
}

const JetpackUpsellPage: React.FC< Props > = ( { siteSlug, productSlug, urlQueryArgs } ) => {
	const upsellSlug = PURCHASE_FLOW_UPSELLS_MATRIX[ productSlug ];
	const productNames = getJetpackProductsDisplayNames();

	const [ isLoadingUpsellPageExperiment, experimentAssignment ] = useExperiment(
		'jetpack_upsell_page_2022_05'
	);

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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
				cta: translate( 'Upgrade your site security for only an additional:' ),
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

	useEffect( () => {
		const dontShowUpsell =
			! isLoadingUpsellPageExperiment && experimentAssignment?.variationName !== 'treatment';

		if ( ( ! upsellSlug || isUpsellOwned || dontShowUpsell ) && productCheckoutURL ) {
			page.redirect( productCheckoutURL );
		}
	}, [
		upsellSlug,
		isUpsellOwned,
		productCheckoutURL,
		isLoadingUpsellPageExperiment,
		experimentAssignment,
	] );

	if ( ! upsellSlug || isFetchingPurchases || isUpsellOwned ) {
		return null;
	}

	return (
		<>
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			{ siteId && <QueryIntroOffers siteId={ siteId } /> }

			<Main wideLayout>
				<h1>
					{ translate( 'Nice choice, we added %(productName)s to your cart.', {
						args: {
							productName,
						},
					} ) }{ ' ' }
					{ intro }
				</h1>
				<p>{ translate( 'Best value' ) }</p>
				<h2>{ upsellName }</h2>
				{ description && <p>{ description }</p> }
				{ features?.length && (
					<ul>
						{ features.map( ( { slug, text } ) => (
							<li key={ slug }>
								{ productNames[ slug ] || slug } -{ ' ' }
								{ slug === productSlug ? translate( 'Already in your cart' ) : text }
							</li>
						) ) }
					</ul>
				) }
				{ ! isLoadingPrice && priceDelta > 0 && (
					<>
						{ cta && <p>{ cta }</p> }
						<PlanPrice rawPrice={ priceDelta } currency={ currencyCode } displayPerMonthNotation />
						<br />
					</>
				) }
				<Button href={ upsellCheckoutURL } primary>
					{ translate( 'Upgrade to %(productName)s', {
						args: {
							productName: upsellName,
						},
					} ) }
				</Button>
				<br />
				<br />
				<Button href={ productCheckoutURL }>
					{ translate( 'No thanks, proceed with %(productName)s', {
						args: {
							productName,
						},
					} ) }
				</Button>
			</Main>
		</>
	);
};

export default JetpackUpsellPage;

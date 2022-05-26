import { TERM_ANNUALLY } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { ITEM_TYPE_PRODUCT } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const BOOST_FREE_URL = isJetpackCloud()
	? '/pricing/jetpack-boost/welcome'
	: 'https://wordpress.org/plugins/jetpack-boost/';

const useBoostFreeItem = (): SelectorProduct => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug: 'jetpack-boost-free',
			isFree: true,
			displayName: translate( 'Boost' ),
			features: {
				items: [
					{ slug: 'not used', text: translate( 'Defer Non-Essential Javascript' ) },
					{ slug: 'not used', text: translate( 'Optimize CSS Structure' ) },
					{ slug: 'not used', text: translate( 'Lazy Image Loading' ) },
				],
			},
			type: ITEM_TYPE_PRODUCT, // not used
			term: TERM_ANNUALLY, // not used
			iconSlug: 'not used',
			shortName: 'not used',
			tagline: 'not used',
			description: 'not used',
		} ),
		[ translate ]
	);
};

export type CardWithPriceProps = {
	siteId: number | null;
};

const CardWithPrice: React.FC< CardWithPriceProps > = ( { siteId } ) => {
	const translate = useTranslate();
	const boostFreeProduct = useBoostFreeItem();

	const dispatch = useDispatch();
	const onButtonClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_product_jpboostfree_click', {
				site_id: siteId ?? undefined,
			} )
		);
	}, [ dispatch, siteId ] );

	return (
		<JetpackProductCard
			className={ classNames( 'jetpack-boost-free-card', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
			hideSavingLabel
			showNewLabel
			showAbovePriceText
			buttonPrimary
			item={ boostFreeProduct }
			headerLevel={ 3 }
			description={ translate(
				"Boost gives your site the same performance advantages as the world's leading websites."
			) }
			buttonLabel={ translate( 'Get Boost' ) }
			buttonURL={ BOOST_FREE_URL }
			onButtonClick={ onButtonClick }
			collapseFeaturesOnMobile
		/>
	);
};

export default CardWithPrice;

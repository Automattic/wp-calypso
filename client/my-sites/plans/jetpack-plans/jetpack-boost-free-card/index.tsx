import { TERM_ANNUALLY } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { ITEM_TYPE_PRODUCT } from 'calypso/my-sites/plans/jetpack-plans/constants';
import isJetpackConnectionPluginActive from 'calypso/state/sites/selectors/is-jetpack-connection-plugin-active';
import useBoostFreeButtonProps from './use-boost-free-button-props';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const useBoostFreeItem = (): SelectorProduct => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug: 'jetpack-boost-free',
			isFree: true,
			displayName: translate( 'Boost' ),
			features: {
				items: [
					{ slug: 'not used', text: translate( 'Optimize CSS loading' ) },
					{ slug: 'not used', text: translate( 'Defer non-essential JavaScript' ) },
					{ slug: 'not used', text: translate( 'Lazy image loading' ) },
					{ slug: 'not used', text: translate( 'Site performance scores' ) },
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
	const boostPluginActive =
		useSelector( ( state ) => isJetpackConnectionPluginActive( state, siteId, 'jetpack-boost' ) ) ||
		false;

	const {
		primary: buttonPrimary,
		href: buttonHref,
		label: buttonLabel,
		onClick: onButtonClick,
	} = useBoostFreeButtonProps( siteId, boostPluginActive );

	return (
		<JetpackProductCard
			className={ classNames( 'jetpack-boost-free-card', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
			hideSavingLabel
			showNewLabel
			showAbovePriceText
			buttonPrimary={ buttonPrimary }
			item={ boostFreeProduct }
			headerLevel={ 3 }
			description={ translate(
				'All of the essential tools to speed up your site — no developer required.'
			) }
			buttonLabel={ buttonLabel }
			buttonURL={ buttonHref }
			onButtonClick={ onButtonClick }
			isOwned={ boostPluginActive }
			collapseFeaturesOnMobile
		/>
	);
};

export default CardWithPrice;

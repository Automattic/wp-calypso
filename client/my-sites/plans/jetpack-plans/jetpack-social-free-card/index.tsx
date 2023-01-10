import { TERM_ANNUALLY } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { ITEM_TYPE_PRODUCT } from 'calypso/my-sites/plans/jetpack-plans/constants';
import isJetpackConnectionPluginActive from 'calypso/state/sites/selectors/is-jetpack-connection-plugin-active';
import useSocialFreeButtonProps from './use-social-free-button-props';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const useSocialFreeItem = (): SelectorProduct => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug: 'jetpack-social-free',
			isFree: true,
			displayName: translate( 'Social', { context: 'Jetpack product name' } ),
			features: {
				items: [
					{ slug: 'not used', text: translate( 'Auto-publish on popular social media platforms' ) },
					{ slug: 'not used', text: translate( 'Schedule your posts' ) },
					{ slug: 'not used', text: translate( 'Preview content before sharing' ) },
					{
						slug: 'not used',
						text: translate( 'Central dashboard to manage all social platform connections' ),
					},
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
	const socialFreeProduct = useSocialFreeItem();

	const socialPluginActive =
		useSelector( ( state ) =>
			isJetpackConnectionPluginActive( state, siteId, 'jetpack-social' )
		) || false;

	const {
		primary: buttonPrimary,
		href: buttonHref,
		label: buttonLabel,
		onClick: onButtonClick,
	} = useSocialFreeButtonProps( siteId, socialPluginActive );

	return (
		<JetpackProductCard
			className={ classNames( 'jetpack-social-free-card', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
			hideSavingLabel
			showNewLabel
			showAbovePriceText
			buttonPrimary={ buttonPrimary }
			item={ socialFreeProduct }
			headerLevel={ 3 }
			description={ translate(
				'Easily share your website content on your social media channels.'
			) }
			buttonLabel={ buttonLabel }
			buttonURL={ buttonHref }
			onButtonClick={ onButtonClick }
			isOwned={ socialPluginActive }
			collapseFeaturesOnMobile
		/>
	);
};

export default CardWithPrice;

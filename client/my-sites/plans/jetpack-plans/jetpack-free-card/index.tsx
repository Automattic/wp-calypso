import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import { ITEM_TYPE_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';
import type { QueryArgs, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

type OwnProps = {
	siteId: number | null;
	urlQueryArgs: QueryArgs;
};

const useFreeItem = (): SelectorProduct => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug: 'free',
			isFree: true,
			displayName: translate( 'Jetpack Free' ),
			features: {
				items: [
					{ slug: 'not used', text: translate( 'Brute force attack protection' ) },
					{ slug: 'not used', text: translate( 'Site stats' ) },
					{ slug: 'not used', text: translate( 'Content Delivery Network' ) },
				],
			},
			type: ITEM_TYPE_PLAN, // not used
			term: TERM_ANNUALLY, // not used
			iconSlug: 'not used',
			shortName: 'not used',
			tagline: 'not used',
			description: 'not used',
		} ),
		[ translate ]
	);
};

const JetpackFreeCard: FC< OwnProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();
	const freeProduct = useFreeItem();

	const { href: buttonHref, onClick: onButtonClick } = useJetpackFreeButtonProps(
		siteId,
		urlQueryArgs
	);

	return (
		<JetpackProductCard
			className="jetpack-free-card"
			hideSavingLabel
			buttonPrimary
			item={ freeProduct }
			headerLevel={ 3 }
			description={ translate(
				'Power up your WordPress site with essential security and performance features.'
			) }
			buttonLabel={ translate( 'Start for free' ) }
			buttonURL={ buttonHref }
			onButtonClick={ onButtonClick }
			collapseFeaturesOnMobile
		/>
	);
};

export default JetpackFreeCard;

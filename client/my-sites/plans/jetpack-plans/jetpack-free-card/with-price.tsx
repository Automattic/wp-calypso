import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

export type CardWithPriceProps = {
	siteId: number | null;
	urlQueryArgs: QueryArgs;
};

const useFreeItem = () => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug: 'free',
			isFree: true,
			displayName: translate( 'Jetpack Free' ),
			features: {
				items: [
					{ text: translate( 'Brute force attack protection' ) },
					{ text: translate( 'Site stats' ) },
					{ text: translate( 'Content Delivery Network' ) },
				],
			},
		} ),
		[ translate ]
	);
};

const JetpackFreeCard: FC< CardWithPriceProps > = ( { siteId, urlQueryArgs } ) => {
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
		/>
	);
};

export default JetpackFreeCard;

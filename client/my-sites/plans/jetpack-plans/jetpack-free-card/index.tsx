import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import ProductCardWithoutPrice from 'calypso/components/jetpack/card/product-without-price';
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

const JetpackFreeCard: FC< JetpackFreeProps > = ( { fullWidth, siteId, urlQueryArgs } ) => {
	const translate = useTranslate();
	const { href: buttonHref, onClick: onButtonClick } = useJetpackFreeButtonProps(
		siteId,
		urlQueryArgs
	);

	const features = useMemo(
		() => [
			translate( 'Brute force attack protection' ),
			translate( 'Site stats' ),
			translate( 'Content Delivery Network' ),
		],
		[ translate ]
	);

	return (
		<ProductCardWithoutPrice
			fullWidth={ fullWidth }
			className="jetpack-free-card"
			productSlug="free"
			displayName={ translate( 'Jetpack Free' ) }
			description={ translate(
				'Power up your WordPress site with essential security and performance features.'
			) }
			productFeatures={ features }
			buttonHref={ buttonHref }
			onButtonClick={ onButtonClick }
			buttonLabel={ translate( 'Start for free' ) }
		/>
	);
};

export default JetpackFreeCard;

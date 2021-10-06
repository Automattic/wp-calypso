import { useTranslate } from 'i18n-calypso';
import { FC, useMemo } from 'react';
import ProductCardWithoutPrice from 'calypso/components/jetpack/card/product-without-price';
import { getForCurrentCROIteration, Iterations } from '../iterations';
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

const JetpackFreeCard: FC< JetpackFreeProps > = ( { fullWidth, siteId, urlQueryArgs } ) => {
	const translate = useTranslate();
	const { href: buttonHref, onClick: onButtonClick } = useJetpackFreeButtonProps(
		siteId,
		urlQueryArgs
	);

	const features = useMemo(
		() =>
			getForCurrentCROIteration( {
				[ Iterations.ONLY_REALTIME_PRODUCTS ]: [
					translate( 'Site stats' ),
					translate( 'Content Delivery Network' ),
					translate( 'Downtime monitoring' ),
					translate( 'Activity Log' ),
				],
			} ) ?? [
				translate( 'Brute force attack protection' ),
				translate( 'Site stats' ),
				translate( 'Content Delivery Network' ),
			],
		[ translate ]
	);

	const description = useMemo(
		() =>
			getForCurrentCROIteration( {
				[ Iterations.ONLY_REALTIME_PRODUCTS ]: translate(
					'Included for free with all products. Get started with Jetpack now at no cost.'
				),
			} ) ??
			translate( 'Power up your WordPress site with essential security and performance features.' ),
		[ translate ]
	);

	return (
		<ProductCardWithoutPrice
			fullWidth={ fullWidth }
			className="jetpack-free-card"
			productSlug="free"
			displayName={ translate( 'Jetpack Free' ) }
			description={ description }
			productFeatures={ features }
			buttonHref={ buttonHref }
			onButtonClick={ onButtonClick }
			buttonLabel={ translate( 'Start for free' ) }
		/>
	);
};

export default JetpackFreeCard;

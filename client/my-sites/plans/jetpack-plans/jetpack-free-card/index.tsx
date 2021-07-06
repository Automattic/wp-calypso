/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FC, useMemo } from 'react';

/**
 * Internal dependencies
 */
import ProductCardWithoutPrice from 'calypso/components/jetpack/card/product-without-price';
import useJetpackFreeButtonProps from './use-jetpack-free-button-props';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

const JetpackFreeCard: FC< JetpackFreeProps > = ( { fullWidth, siteId, urlQueryArgs } ) => {
	const translate = useTranslate();
	const { href: buttonHref, onClick: onButtonClick } = useJetpackFreeButtonProps(
		siteId,
		urlQueryArgs
	);

	const features = useMemo(
		() => [
			translate( 'Site stats' ),
			translate( 'Brute force attack protection' ),
			translate( 'Content Delivery Network' ),
			translate( 'Automated social media posting' ),
			translate( 'Downtime monitoring' ),
			translate( 'Activity Log' ),
		],
		[ translate ]
	);

	return (
		<ProductCardWithoutPrice
			fullWidth={ fullWidth }
			className="jetpack-free-card"
			productSlug="free"
			displayName={ translate( 'Jetpack Free' ) }
			description={ translate( 'Included for free with all products' ) }
			productFeatures={ features }
			buttonHref={ buttonHref }
			onButtonClick={ onButtonClick }
			buttonLabel={ translate( 'Start for free' ) }
		/>
	);
};

export default JetpackFreeCard;

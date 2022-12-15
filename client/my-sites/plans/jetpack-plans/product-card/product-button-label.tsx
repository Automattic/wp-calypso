import { planHasFeature } from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';
import React from 'react';
import { ITEM_TYPE_PRODUCT } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';

interface productButtonLabelProps {
	product: SelectorProduct;
	isOwned: boolean;
	isUpgradeableToYearly: boolean;
	isSuperseded: boolean;
	isDeprecated: boolean;
	currentPlan?: SitePlan | null;
	fallbackLabel?: TranslateResult;
}

export default function productButtonLabel( {
	product,
	isOwned,
	isUpgradeableToYearly,
	isDeprecated,
	isSuperseded,
	currentPlan,
	fallbackLabel,
}: productButtonLabelProps ): TranslateResult {
	if ( isDeprecated ) {
		return translate( 'No longer available' );
	}

	if ( isUpgradeableToYearly ) {
		return translate( 'Upgrade to Yearly' );
	}

	if (
		isOwned ||
		isSuperseded ||
		( currentPlan && planHasFeature( currentPlan.product_slug, product.productSlug ) )
	) {
		return product.type !== ITEM_TYPE_PRODUCT
			? translate( 'Manage Plan' )
			: translate( 'Manage Subscription' );
	}

	if ( fallbackLabel ) {
		return fallbackLabel;
	}

	const { buttonLabel, displayName } = product;

	return (
		buttonLabel ??
		translate( 'Get {{name/}}', {
			components: {
				name: <>{ displayName }</>,
			},
			comment: '{{name/}} is the name of a product',
		} )
	);
}

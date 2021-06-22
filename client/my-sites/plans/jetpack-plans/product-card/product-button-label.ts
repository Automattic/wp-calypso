/**
 * External dependencies
 */
import { planHasFeature } from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';
import { createElement, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { ITEM_TYPE_PRODUCT } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';

interface productButtonLabelProps {
	product: SelectorProduct;
	isOwned: boolean;
	isUpgradeableToYearly: boolean;
	isDeprecated: boolean;
	currentPlan?: SitePlan | null;
}

export default function productButtonLabel( {
	product,
	isOwned,
	isUpgradeableToYearly,
	isDeprecated,
	currentPlan,
}: productButtonLabelProps ): TranslateResult {
	if ( isDeprecated ) {
		return translate( 'No longer available' );
	}

	if ( isUpgradeableToYearly ) {
		return translate( 'Upgrade to Yearly' );
	}

	if (
		isOwned ||
		( currentPlan && planHasFeature( currentPlan.product_slug, product.productSlug ) )
	) {
		return product.type !== ITEM_TYPE_PRODUCT
			? translate( 'Manage Plan' )
			: translate( 'Manage Subscription' );
	}

	const { buttonLabel, displayName } = product;

	return (
		buttonLabel ??
		translate( 'Get {{name/}}', {
			components: {
				name: createElement( Fragment, {}, displayName ),
			},
			comment: '{{name/}} is the name of a product',
		} )
	);
}

/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	isDomainProduct,
	isDomainTransfer,
	isGoogleApps,
	isPlan,
	isTheme,
	isFreePlan,
} from 'lib/products-values';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'gridicons';

// Expects a product to be an object with productSlug. e.g. `{ productSlug: 'premium_theme' }`
export default function ProductIcon( { productSlug, className } ) {
	if ( ! productSlug ) {
		return null;
	}

	const product = { productSlug };

	let icon;

	if ( isPlan( product ) || isFreePlan( product ) ) {
		icon = <PlanIcon plan={ productSlug } />;
	} else if ( isDomainProduct( product ) || isDomainTransfer( product ) ) {
		icon = <Gridicon icon={ 'domains' } />;
	} else if ( isTheme( product ) ) {
		icon = <Gridicon icon={ 'themes' } />;
	} else if ( isGoogleApps( product ) ) {
		icon = <Gridicon icon={ 'mail' } />;
	}

	return <div className={ classNames( 'product-icon', className ) }>{ icon }</div>;
}

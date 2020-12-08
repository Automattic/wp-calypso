/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackBundleCard from 'calypso/components/jetpack/card/jetpack-bundle-card';
import { bundleCardWithBadge, bundleCardWithDiscount } from '../fixture';

export default function JetpackBundleCardExample() {
	return (
		<div>
			<h3>Jetpack Bundle Card with Badge</h3>
			<JetpackBundleCard { ...bundleCardWithBadge } />
			<br />
			<h3>Jetpack Bundle Card with Discount</h3>
			<JetpackBundleCard { ...bundleCardWithDiscount } />
		</div>
	);
}

JetpackBundleCardExample.displayName = 'JetpackBundleCardExample';

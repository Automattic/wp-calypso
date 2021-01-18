/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Type dependencies
 */
import type { ProductCardFeaturesItem } from './types';

/**
 * Styles dependencies
 */
import checkmarkIcon from './assets/checkmark.svg';

interface Props {
	item: ProductCardFeaturesItem;
}

const JetpackProductCardFeaturesItem: React.FC< Props > = ( { item: { text } } ) => (
	<li className="jetpack-product-card-i5__features-item">
		<img className="jetpack-product-card-i5__features-icon" src={ checkmarkIcon } alt="" />
		<p className="jetpack-product-card-i5__features-text">{ preventWidows( text ) }</p>
	</li>
);

export default JetpackProductCardFeaturesItem;

/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import FeaturesItem from './features-item';

/**
 * Type dependencies
 */
import type { ProductCardFeatures, ProductCardFeaturesItem } from './types';

export interface Props {
	className?: string;
	features: ProductCardFeatures;
}

const JetpackProductCardFeatures: React.FC< Props > = ( { className, features: { items } } ) => {
	return (
		<section className={ classnames( className, 'jetpack-product-card-i5__features' ) }>
			<ul className="jetpack-product-card-i5__features-list">
				{ ( items as ProductCardFeaturesItem[] ).map( ( item, i ) => (
					<FeaturesItem key={ i } item={ item } />
				) ) }
			</ul>
		</section>
	);
};

export default JetpackProductCardFeatures;
